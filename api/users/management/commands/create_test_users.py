"""
Management command to create test users for development.
"""

from django.core.management.base import BaseCommand
from users.models import User


class Command(BaseCommand):
    help = "Create test users for development"

    def handle(self, *args, **options):
        # Create admin user
        if not User.objects.filter(email="admin@azuregroup.com").exists():
            admin = User.objects.create_superuser(
                email="admin@azuregroup.com",
                password="admin123",
                first_name="Admin",
                last_name="User",
            )
            self.stdout.write(
                self.style.SUCCESS(f'Successfully created admin user: {admin.email}')
            )
        else:
            self.stdout.write(
                self.style.WARNING('Admin user already exists')
            )

        # Create regular user
        if not User.objects.filter(email="user@azuregroup.com").exists():
            user = User.objects.create_user(
                email="user@azuregroup.com",
                password="user123",
                first_name="Test",
                last_name="User",
                role="user",
            )
            self.stdout.write(
                self.style.SUCCESS(f'Successfully created test user: {user.email}')
            )
        else:
            self.stdout.write(
                self.style.WARNING('Test user already exists')
            )
