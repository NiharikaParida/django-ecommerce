from django.contrib.auth import get_user_model
from django.test import TestCase
import json


class LoginTests(TestCase):
    def test_login_with_email_for_existing_user(self):
        User = get_user_model()
        User.objects.create_user(
            username='demo-user',
            email='demo@example.com',
            password='Demo@1234',
        )

        response = self.client.post(
            '/api/auth/login/',
            data=json.dumps({'email': 'Demo@Example.com', 'password': 'Demo@1234'}),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['email'], 'demo@example.com')
        self.assertTrue(self.client.get('/api/auth/me/').json()['authenticated'])

        logout_response = self.client.post('/api/auth/logout/')
        self.assertEqual(logout_response.status_code, 200)
        self.assertFalse(self.client.get('/api/auth/me/').json()['authenticated'])

    def test_register_creates_account_and_logs_user_in(self):
        response = self.client.post(
            '/api/auth/register/',
            data=json.dumps({
                'name': 'New Shopper',
                'email': 'New@Example.com',
                'password': 'StrongPass123!',
            }),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()['name'], 'New Shopper')
        self.assertTrue(self.client.get('/api/auth/me/').json()['authenticated'])
