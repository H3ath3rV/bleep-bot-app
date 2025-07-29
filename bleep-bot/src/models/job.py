# File: bleep-bot/src/models/job.py

from .user import db
from datetime import datetime

class Job(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    original_filename = db.Column(db.String(255), nullable=False)
    processed_at = db.Column(db.DateTime, default=datetime.utcnow)
    profanity_detected_count = db.Column(db.Integer, default=0)
    status = db.Column(db.String(50), default='Completed')

    def to_dict(self):
        return {
            'id': self.id,
            'original_filename': self.original_filename.split('_', 1)[-1], # Clean up the UUID
            'processed_at': self.processed_at.strftime('%Y-%m-%d %H:%M:%S'),
            'profanity_detected_count': self.profanity_detected_count,
            'status': self.status
        }