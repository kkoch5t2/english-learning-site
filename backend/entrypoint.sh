#!/bin/sh

# Wait for the database to be ready
if [ "$POSTGRES_DB_NAME" = "db_english_learning" ]
then
    echo "Waiting for postgres..."

    while ! nc -z $POSTGRES_DB_HOST $POSTGRES_DB_PORT; do
      sleep 1
    done

    echo "PostgreSQL started"
fi

echo "Applying database migrations"
python manage.py migrate

echo "Creating initial user"
python create_initial_user.py

# Execute the command passed as arguments to the script (i.e., starting the server)
exec "$@"
