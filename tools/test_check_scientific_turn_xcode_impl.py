import sys
import unittest
from pathlib import Path
from unittest.mock import patch

TOOLS_DIR = Path(__file__).resolve().parent
if str(TOOLS_DIR) not in sys.path:
    sys.path.insert(0, str(TOOLS_DIR))

import check_scientific_turn_xcode_impl as checker


class CheckerSemanticsTest(unittest.TestCase):
    def test_status_scientific_matrix(self) -> None:
        self.assertEqual(checker._status_scientific(True, True), 'partial')
        self.assertEqual(checker._status_scientific(True, False), 'verified')
        self.assertEqual(checker._status_scientific(False, True), 'false')
        self.assertEqual(checker._status_scientific(False, False), 'unknown')

    def test_status_xcode_matrix(self) -> None:
        self.assertEqual(checker._status_xcode(True, True), 'partial')
        self.assertEqual(checker._status_xcode(True, False), 'verified')
        self.assertEqual(checker._status_xcode(False, True), 'false')
        self.assertEqual(checker._status_xcode(False, False), 'unknown')

    def test_conflict_marker_detection_is_line_based(self) -> None:
        with patch.object(checker, '_read', return_value='normal\n<<<<<<< HEAD\nfoo\n'):
            self.assertTrue(checker._has_conflict_markers('dummy'))

        # String literal mention should not be treated as unresolved merge marker.
        with patch.object(checker, '_read', return_value='print("marker <<<<<<< in docs")\n'):
            self.assertFalse(checker._has_conflict_markers('dummy'))


if __name__ == '__main__':
    unittest.main()
