## StreamEvents
## ✨ Objectius
StreamEvents és una aplicació Django per gestionar esdeveniments i usuaris, amb suport de grups i permisos, i amb la possibilitat d’utilitzar MongoDB com a base de dades. El projecte inclou fixtures i scripts per inicialitzar la base de dades amb dades realistes de prova.

## 🧱 Stack Principal
- Backend: Django
- Base de dades: MongoDB amb Djongo (opcional)
- Autenticació: CustomUser + Group + Permissions
- Generació de dades de prova: Faker
- Gestió d’imatges: Pillow (si hi ha ImageField)

## 📂 Estructura Simplificada
streamevents/
├── manage.py
├── users/
│ ├── models.py
│ ├── fixtures/
│ │ ├── 01_groups.json
│ │ └── 02_users.json
│ └── ...
├── templates/
└── ...


## ✅ Requisits previs
- Python >= 3.10
- Django >= 4.x
- Djongo
- Pillow (si tens camps ImageField)
- Faker (si utilitzes scripts per generar usuaris de prova)


## 🚀 Instal·lació ràpida
bash
# Crear entorn virtual
python -m venv venv
source venv/bin/activate      # Linux/macOS
venv\Scripts\activate         # Windows

# Instal·lar dependències
pip install -r requirements.txt

# Migracions
python manage.py makemigrations
python manage.py migrate



## 🔐 Variables d'entorn (env.example)
# Exemple de fitxer .env
DJANGO_SECRET_KEY="la_teva_clau_secreta"
DEBUG=True
DB_NAME=streamevents
DB_HOST=localhost
DB_PORT=27017
DB_USER=
DB_PASSWORD=


## 👤 Superusuari
python manage.py createsuperuser
# Segueix les instruccions per posar username, email i password


## 🗃️ Migrar a MongoDB (opcional futur)
DATABASES = {
    'default': {
        'ENGINE': 'djongo',
        'NAME': 'streamevents',
    }
}

## 🛠️ Comandes útils
# Arrencar el servidor
python manage.py runserver

# Accedir a l’admin
http://127.0.0.1:8000/admin

# Crear superusuari
python manage.py createsuperuser

# 💾 Fixtures (exemple)

## Primer, carrega els grups
python manage.py loaddata users/fixtures/01_groups.json

## Després, carrega els usuaris
python manage.py loaddata users/fixtures/02_users.json

## També es poden carregar totes a la vegada
python manage.py loaddata users/fixtures/*.json

## Comprovar grups
python manage.py shell -c "from django.contrib.auth.models import Group; print(Group.objects.all())"

## Comprovar usuaris
python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); print(User.objects.all())"

## 🌱 Seeds (exemple d'script)
python manage.py seed_users --users 25 --clear
