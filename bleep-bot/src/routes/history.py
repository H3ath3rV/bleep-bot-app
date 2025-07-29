# File: bleep-bot/src/routes/history.py

from flask import Blueprint, jsonify
from ..models.job import Job

history_bp = Blueprint('history', __name__)

@history_bp.route('/history', methods=['GET'])
def get_history():
    """Returns a list of all processed jobs."""
    try:
        # Query the database for all jobs, order by the most recent first
        jobs = Job.query.order_by(Job.processed_at.desc()).all()
        
        # Convert the list of job objects into a list of dictionaries
        history_list = [job.to_dict() for job in jobs]
        
        return jsonify({
            'success': True,
            'history': history_list
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500