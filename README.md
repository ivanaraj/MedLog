# MedLog - Medicinski informacioni sistem

Medicinski informacioni sistem za upravljanje pacijentima, pregledom i specijalizacijama.

### Preduslov

Pre nego što pocnete sa pokretanjem aplikacije, potrebno je da instalirate:

- **[.NET SDK 9.0](https://dotnet.microsoft.com/download/dotnet/9.0)** - za backend
- **[Node.js 18+](https://nodejs.org/)** - za frontend
- **[Docker Desktop](https://www.docker.com/products/docker-desktop)** - za MongoDB
- **[Docker Compose](https://docs.docker.com/compose/install/)** - za upravljanje kontejnerima


### Konfiguracija okruženja (.env fajl)

Kreirajte `.env` fajl u `backend/` direktorijumu na osnovu `.env.example`:

Ažurirajte `.env` fajl sa ovim vrednostima:

```dotenv
CONNECTION_STRING=mongodb://user:root@localhost:27017
DATABASE_NAME=MedLogDb
MONGO_INITDB_ROOT_USERNAME=user
MONGO_INITDB_ROOT_PASSWORD=root
JWT_KEY=d1eb4fa9858411aba71db429edb77d7d
```

## Pokretanje aplikacije

#### Pokretanje MongoDB i Mongo Express kontejnera
docker-compose up -d
```
Ovo ce se pokrenuti:
- **MongoDB** na `localhost:27017`
- **Mongo Express** na `http://localhost:8081` (za pregled baze)
```

## Pokretanje Backend-a

```bash
cd backend

# Instalacija zavisnosti (ako nije vec urađeno)
dotnet restore

# Pokretanje aplikacije
dotnet run

Backend ce biti dostupan na: **`http://localhost:5000`**

API dokumentacija (Swagger): **`http://localhost:5000/swagger`**
```
##  Pokretanje Frontend-a

U novom terminalu:

```bash
cd frontend

# Instalacija zavisnosti
npm install

# Pokretanje aplikacije u development modu
npm run dev
```

Frontend ce biti dostupan na: **`http://localhost:5173`**



## Pristup aplikaciji

- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000`
- **Swagger dokumentacija:** `http://localhost:5000/swagger`
- **Mongo Express:** `http://localhost:8081`

---

## Zaustavljanje aplikacije

### Zaustavljanje kontejnera

```bash
cd backend
docker-compose down
```

### Brisanje svih podataka (opciono)

```bash
docker-compose down -v
```


## Napomene

- Aplikacija koristi JWT za autentifikaciju
- MongoDB je osnovna baza podataka
- Frontend je uokviren sa React Context API-jem za stanje

Kada se pokrene aplikacija, potrebno je da se preko swagger-a kreira admin, koji ce da se uloguje i zatim doda specijalizacije i doktore.
