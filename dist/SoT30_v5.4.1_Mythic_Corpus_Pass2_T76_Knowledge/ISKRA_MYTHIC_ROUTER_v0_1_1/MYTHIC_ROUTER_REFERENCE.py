#!/usr/bin/env python3
from __future__ import annotations
from pathlib import Path
import json

DEPTH={'LIGHT':0,'STANDARD':1,'DEEP':2,'SURGERY':3}
VOICE=4; PLAYBOOK=3; MOTIF=2; FUNCTION=2

class MythicRouter:
    VERSION='0.1.1'

    def __init__(self, path: str | Path):
        self.fragments=[json.loads(x) for x in Path(path).read_text(encoding='utf-8').splitlines() if x.strip()]

    @staticmethod
    def voice_alignment_class(fragment: dict, selected_voice: str) -> int:
        voices=fragment['voices']
        if voices == [selected_voice] or set(voices) == {selected_voice}:
            return 3
        if selected_voice in voices:
            return 2
        if fragment.get('voice_neutral', False):
            return 1
        return 0

    @staticmethod
    def _use_as(fragment: dict) -> str:
        return 'analogy' if 'analogy' in fragment['allowed_effects'] else fragment['allowed_effects'][0]

    def route(self, request: dict) -> dict:
        pref=request['myth_preference']
        if pref=='PLAIN':
            return {'router_version':self.VERSION,'enabled':False,'fragments':[],'myth_budget':0,'blocked_reasons':['PLAIN']}
        budget=0 if request['safety_state']=='crisis' else (1 if pref=='BALANCED' else 3)
        if budget==0:
            return {'router_version':self.VERSION,'enabled':False,'fragments':[],'myth_budget':0,'blocked_reasons':['CRISIS_DEFAULT_OFF']}

        max_depth=DEPTH[request['consent_depth']]
        selected_voice=request['selected_voice']
        score_voices={selected_voice,*request.get('supporting_voices',[])}
        requested_motifs=set(request.get('motifs',[]))
        requested_functions=set(request.get('functions',[]))
        ranked=[]; blocked=[]

        for f in self.fragments:
            if DEPTH[f['depth_required']]>max_depth:
                blocked.append({'fragment_id':f['id'],'reason':'DEPTH'}); continue
            if f['myth_register']=='MYTHIC' and pref!='MYTHIC':
                blocked.append({'fragment_id':f['id'],'reason':'REGISTER'}); continue
            if request.get('technical_nature_question') and f['disclosure_required']:
                blocked.append({'fragment_id':f['id'],'reason':'TECHNICAL_NATURE'}); continue

            alignment=self.voice_alignment_class(f,selected_voice)
            if alignment==0:
                blocked.append({'fragment_id':f['id'],'reason':'VOICE_ALIGNMENT'}); continue

            voice_hits=len(score_voices.intersection(f['voices']))
            playbook_hit=1 if request['playbook'] in f['playbooks'] else 0
            motif_hits=len(requested_motifs.intersection(f['motifs']))
            function_hits=len(requested_functions.intersection(f['functions']))
            total=VOICE*voice_hits + PLAYBOOK*playbook_hit + MOTIF*motif_hits + FUNCTION*function_hits
            if total<=0:
                continue
            ranked.append({
                'fragment':f,'total_score':total,'voice_alignment_class':alignment,
                'voice_count':len(f['voices']),'voice_hits':voice_hits,
                'function_hits':function_hits,'motif_hits':motif_hits,'playbook_hit':playbook_hit
            })

        ranked.sort(key=lambda x:(
            -x['total_score'],
            -x['voice_alignment_class'],
            x['voice_count'],
            -x['function_hits'],
            -x['motif_hits'],
            -x['playbook_hit'],
            x['fragment']['disclosure_required'],
            x['fragment']['id'],
        ))

        selected=[]; source_files=set()
        for item in ranked:
            if len(selected)>=budget: break
            f=item['fragment']
            if pref=='MYTHIC' and len(source_files)>=2 and f['source']['file'] not in source_files:
                continue
            selected.append({
                'fragment_id':f['id'],'source_file':f['source']['file'],
                'line_range':[f['source']['line_start'],f['source']['line_end']],
                'score':item['total_score'],'voice_alignment_class':item['voice_alignment_class'],
                'voice_count':item['voice_count'],
                'score_breakdown':{
                    'voice_hits':item['voice_hits'],'playbook_hit':item['playbook_hit'],
                    'motif_hits':item['motif_hits'],'function_hits':item['function_hits']
                },
                'use_as':self._use_as(f),'disclosure_required':f['disclosure_required'],
                'voice_neutral':f.get('voice_neutral',False),
                'forbidden_effects':f['forbidden_effects']
            })
            source_files.add(f['source']['file'])

        return {
            'router_version':self.VERSION,'enabled':bool(selected),'fragments':selected,
            'myth_budget':budget,'blocked_reasons':blocked
        }

    @staticmethod
    def finalize_provenance(route_result: dict, used_fragment_ids: list[str], used_image_sources: list[str] | None=None) -> dict:
        # used_image_sources are fragment IDs that supplied a corpus-derived image/metaphor.
        used_image_sources=used_image_sources or []
        routed={x['fragment_id']:x for x in route_result.get('fragments',[])}
        requested=set(used_fragment_ids)|set(used_image_sources)
        unknown=sorted(requested-set(routed))
        if unknown:
            return {'ok':False,'errors':[{'reason':'UNROUTED_PROVENANCE','fragment_ids':unknown}],
                    'used_fragment_ids':sorted(set(used_fragment_ids)),
                    'used_image_sources':sorted(set(used_image_sources)),
                    'provenance':[],'disclosure_required':False}
        provenance=[routed[i] for i in sorted(requested)]
        return {'ok':True,'errors':[],
                'used_fragment_ids':sorted(set(used_fragment_ids)),
                'used_image_sources':sorted(set(used_image_sources)),
                'provenance':provenance,
                'disclosure_required':any(x['disclosure_required'] for x in provenance)}
