from .extensions import db
#* define all models here

#& user data schema
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    spotify_id = db.Column(db.String(128), unique=True, nullable=False)
    email = db.Column(db.String(128), unique=True, nullable=False)

    def __repr__(self):
        return f'<User {self.email}>' #~ self: instance of the class being used, current object instance: https://www.geeksforgeeks.org/self-in-python-class/
    
#todo add more models later, (etc ListeningHistory, ConcertEvents)