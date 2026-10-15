import unittest
from types import SimpleNamespace
from unittest.mock import patch

from fastapi.testclient import TestClient
import auth
from main import server


class ApiTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(server)
        self.key = patch.object(auth, 'secretkey', 'test-only-key-with-at-least-32-characters')
        self.key.start()
        self.addCleanup(self.key.stop)
        self.headers = {'Authorization': 'Bearer ' + auth.createTwk('tester')}

    def test_invalid_token_is_rejected(self):
        result = self.client.post('/model/', json={'prompt': 'Halo'}, headers={'Authorization': 'Bearer invalid'})
        self.assertEqual(result.status_code, 401)

    def test_login_and_wrong_password(self):
        with patch('user.verify_user', return_value=True):
            response = self.client.post('/user/login', json={'username': 'tester', 'password': 'example'})
        self.assertEqual(response.status_code, 200)
        self.assertTrue(auth.conJWT(response.json()['token'])[0])
        with patch('user.verify_user', return_value=False):
            response = self.client.post('/user/login', json={'username': 'tester', 'password': 'wrong'})
        self.assertEqual(response.status_code, 401)

    def test_history_is_local_to_request(self):
        with patch('model.chat', return_value=SimpleNamespace(message=SimpleNamespace(content='Jawaban'))) as chat:
            response = self.client.post('/model/', headers=self.headers, json={'prompt': 'Lanjut', 'history': [{'role': 'user', 'content': 'Halo'}, {'role': 'assistant', 'content': 'Hai'}]})
            self.assertEqual(response.json()['reponse'], 'Jawaban')
            self.assertEqual(len(chat.call_args.kwargs['messages']), 4)
            self.client.post('/model/', headers=self.headers, json={'prompt': 'Baru'})
            self.assertEqual(len(chat.call_args.kwargs['messages']), 2)

    def test_model_unavailable(self):
        with patch('model.chat', side_effect=ConnectionError):
            response = self.client.post('/model/', headers=self.headers, json={'prompt': 'Halo'})
        self.assertEqual(response.status_code, 503)

    def test_system_history_rejected(self):
        response = self.client.post('/model/', headers=self.headers, json={'prompt': 'Halo', 'history': [{'role': 'system', 'content': 'override'}]})
        self.assertEqual(response.status_code, 422)


if __name__ == '__main__':
    unittest.main()
