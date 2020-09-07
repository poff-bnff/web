# -*- coding: UTF-8 -*-

# test_fetch_data.py
import fetch_data
import unittest

creds = fetch_data.authenticate()
service = fetch_data.connect(creds)
sheetName = 'art-en'


class TestAdd(unittest.TestCase):
    """
    Test the add function from the mymath library
    """


    def test_authenticate(self):
        """
        Test that creds exists
        """

        result = fetch_data.authenticate()
        self.assertNotEqual(result, None)


    def test_connect(self):
        """
        Test that service exists
        """

        result = fetch_data.connect(creds)
        self.assertNotEqual(result, None)

    def test_fetchDataFromSheet(self):
        """
        Test that data from sheets fetches
        """

        result = fetch_data.fetchDataFromSheet(service, sheetName)
        self.assertNotEqual(result,None)

    def test_report(self):
        """
        Test that intended amount of sheets are fetched
        """

        result = fetch_data.report()
        self.assertEqual(result,14)

if __name__ == '__main__':
    unittest.main()
