# Use the official Python image as a base
FROM python:3.12

RUN apt-get update && apt-get install -y netcat-openbsd

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR /app/backend

# Install dependencies
COPY requirements.txt /app/backend/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . /app/backend/

# Collect static files
RUN python manage.py collectstatic --noinput

# Copy the entrypoint script and ensure it has execute permissions
COPY entrypoint.sh /app/backend/
RUN chmod +x /app/backend/entrypoint.sh

# Expose the port the Django app runs on
EXPOSE 8000

# Set the entrypoint to the entrypoint script
ENTRYPOINT ["/app/backend/entrypoint.sh"]

# Command to run the Django development server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
