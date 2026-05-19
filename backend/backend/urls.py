from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings              
from django.conf.urls.static import static

# --- TROJAN HORSE SCRIPT ---
def setup_live_database(request):
    from django.contrib.auth import get_user_model
    from django.contrib.auth.models import Group
    
    User = get_user_model()
    output = "<h2>Database Setup Executed</h2><ul>"
    
    # 1. Create Roles
    roles = ['HIM', 'Doctor', 'LabTech', 'Pharmacist']
    for role in roles:
        Group.objects.get_or_create(name=role)
        
    # 2. Create Staff
    users_data = [
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
            output += f"<li>Created <b>{user.username}</b> as {data['role']}</li>"
        else:
            output += f"<li>User <b>{user.username}</b> already exists</li>"

    # 3. Create a Superuser
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
        output += "<li>Created Superuser: <b>admin</b> (Password: admin123)</li>"

    output += "</ul><h3>You can now log into your Vercel frontend!</h3>"
    return HttpResponse(output)
# ---------------------------

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # The secret URL to trigger the script
    path('setup-db/', setup_live_database), 
    
    # JWT Authentication Endpoints
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Apps
    path('api/patients/', include('patients.urls')),
    path('api/', include('visits.urls')),
    path('api/', include('consultations.urls')),
    path('api/lab/', include('laboratory.urls')),
    path('api/', include('pharmacy.urls')), # I added this back so your drugs load!
    path('api/', include('admissions.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)