import os
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

import firebase_admin
from firebase_admin import credentials, firestore

_app = None


def get_firestore_client():
    global _app
    if _app is None:
        cred_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
        if cred_path:
            cred = credentials.Certificate(cred_path)
        else:
            cred = credentials.ApplicationDefault()
        _app = firebase_admin.initialize_app(cred)
    return firestore.client()
