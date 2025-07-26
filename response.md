# Response
> The Current content is an **example template**; please edit it to fit your style and content.
## A. Required Information
### A.1. Requirement Completion Rate
- [x] List all pharmacies open at a specific time and on a day of the week if requested.
  - Implemented at getPharmaciesOnSpecificTime API.
- [x] List all masks sold by a given pharmacy, sorted by mask name or price.
  - Implemented at getMasksByPharmacy API.
- [x] List all pharmacies with more or less than x mask products within a price range.
  - Implemented at filterPharmaciesByMask API.
- [x] The top x users by total transaction amount of masks within a date range.
  - Implemented at getTopUsersByTransactions API.
- [x] The total number of masks and dollar value of transactions within a date range.
  - Implemented at getTransactionSummary API.
- [x] Search for pharmacies or masks by name, ranked by relevance to the search term.
  - Implemented at search API.
- [x] Process a user purchases a mask from a pharmacy, and handle all relevant data changes in an atomic transaction.
  - Implemented at purchaseMask API.
### A.2. API Document
> Please describe how to use the API in the API documentation. You can edit by any format (e.g., Markdown or OpenAPI) or free tools (e.g., [hackMD](https://hackmd.io/), [postman](https://www.postman.com/), [google docs](https://docs.google.com/document/u/0/), or  [swagger](https://swagger.io/specification/)).

Import [this](./api-document.json) json file to Postman.

### A.3. Import Data Commands
Please run these two script commands to migrate the data into the database.

```bash
$ node scripts/pharmacy_ETL.js
$ node scripts/user_ETL.js
```
## B. Bonus Information

>  If you completed the bonus requirements, please fill in your task below.
### B.1. Test Coverage Report

I wrote down the 20 unit tests for the APIs I built. Please check the test coverage report at [here](#test-coverage-report).

You can run the test script by using the command below:

```bash
bundle exec rspec spec
```

### B.2. Dockerized
Please check my Dockerfile / docker-compose.yml at [here](#dockerized).

On the local machine, please follow the commands below to build it.

```bash
$ docker-compose up --build -d

# go inside the container, run the migrate data command.
$ docker exec -it phantom_web sh
$ node scripts/pharmacy_ETL.js
$ node scripts/user_ETL.js
```

### B.3. Demo Site Url

The demo site is ready on [my AWS demo site](#demo-site-url); you can try any APIs on this demo site.

## C. Other Information

### C.1. ERD

My ERD [erd-link](#erd-link).

### C.2. Technical Document

For frontend programmer reading, please check this [technical document](technical-document) to know how to operate those APIs.

- --
