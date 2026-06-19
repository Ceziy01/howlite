from app.core.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.workspace import Workspace, Note  # ensure tables are created
from app.services.auth import hash_password

def init_database():
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        user_count = db.query(User).count()
        
        if user_count > 0:
            return

        admin = User(
            name = "Admin",
            username = "admin",
            password_hash = hash_password("12345678"),
            role=UserRole.admin
        )
        db.add(admin)
        db.commit()
    except Exception as e: db.rollback()
    finally: db.close()