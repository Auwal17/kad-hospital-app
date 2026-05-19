from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group

# This automatically grabs your custom 'accounts.User' model
User = get_user_model() 

users_data = [
    {'username': 'desk1', 'email': 'desk1@hospital.com', 'password': 'password123', 'role': 'HIM'},
    {'username': 'doc1', 'email': 'doc1@hospital.com', 'password': 'password123', 'role': 'Doctor'},
    {'username': 'lab1', 'email': 'lab1@hospital.com', 'password': 'password123', 'role': 'LabTech'},
    {'username': 'pharm1', 'email': 'pharm1@hospital.com', 'password': 'password123', 'role': 'Pharmacist'},
]

for data in users_data:
    user, created = User.objects.get_or_create(
        username=data['username'],
        defaults={'email': data['email']}
    )
    if created:
        user.set_password(data['password'])
        user.save()
        group = Group.objects.get(name=data['role'])
        user.groups.add(group)
        print(f"Created {user.username} as {data['role']}")
    else:
        print(f"User {user.username} already exists.")
