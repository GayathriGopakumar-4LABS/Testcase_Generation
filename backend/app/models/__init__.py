# Import all models so Alembic can discover them for autogenerate
from app.models.user import User  # noqa: F401
from app.models.project import Project  # noqa: F401
from app.models.generation import Generation  # noqa: F401
