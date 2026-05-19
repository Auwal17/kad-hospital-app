from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group

User = get_user_model() 

roles = ['HIM', 'Doctor', 'LabTech', 'Pharmacist']
for role in roles:
    Group.objects.get_or_create(name=role)

    users_data: list[dict[str, str]] = [
       {'username': 'desk1', 'password': 'password123', 'role': 'HIM'},
       {'username': 'doc1', 'password': 'password123', 'role': 'Doctor'},
       {'username': 'lab1', 'password': 'password123', 'role': 'LabTech'},
       {'username': 'pharm1', 'password': 'password123', 'role': 'Pharmacist'},
    ]

for data in users_data:
       user, created = User.objects.get_or_create(username=data['username'])
       if created:
           user.set_password(data['password'])
           user.save()
           group = Group.objects.get(name=data['role'])
           user.groups.add(group)
           print(f"Created {user.username} as {data['role']}")