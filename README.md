# Front-End-M8-EP2
1. docker

i. Se instalaron los software necesarios
sudo apt install docker.io docker-compose

ii. Se crearon los archivos Dockerfile y docker-compose.yml en la raiz del proyecto

iii. Se ejecutaron los comandos
sudo docker build -t 18-alpine -f ./Dockerfile .
sudo docker-compose build
docker-compose up --build

iv. El Dockerfile tiene como requisito que el paso de contruccion y despliegue de la PWA funcione correctamente (última actividad M6EP3)
npm run build
npm install -g serve
serve -s dist

v. Se ejecuta el docker y el docker compose en terminales diferentes
sudo docker run -p 3000:3000 18-alpine
sudo docker-compose up -d

(sudo docker-compose ps)
(sudo docker-compose down --remove-orphans)

vi. No se implemento un servidor de backend en este ejemplo
npm run server

2. Jest y Testing Library React 
i. requisitos
npm install --save-dev @testing-library/react @testing-library/dom @types/react @types/react-dom
npm install --save-dev @types/jest @types/testing-library__jest-dom
npm install --save-dev ts-jest

ii. se implementaron pruebas para el Login

iii.ejecucion
npm test

> m8-ep2@0.0.0 test
> jest

(node:44729) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
 PASS  src/pages/__test__/Login.test.tsx
  <Login />
    ✓ should call login with admin credentials and navigate to dashboard (124 ms)
    ✓ should call login with user credentials and navigate to home (45 ms)
    ✓ should display error message for incorrect credentials (25 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        2.584 s, estimated 4 s
Ran all test suites.

3. 