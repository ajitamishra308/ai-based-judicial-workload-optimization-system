from sqlalchemy import Column, Integer, String, Text, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

Base = declarative_base()


class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, default="Untitled Case")
    petitioner = Column(String, default="")
    respondent = Column(String, default="")
    court = Column(String, default="District Court")
    case_type = Column(String, default="Others")
    stage = Column(String, default="Admission")
    decision_date = Column(String, nullable=True)
    disposal_nature = Column(String, default="Pending")
    full_text = Column(Text, default="")
    summary = Column(Text, default="")
    cluster_id = Column(Integer, nullable=True)


DATABASE_URL = "sqlite:///./cases.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
