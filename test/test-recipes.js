const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

// this lets us use *should* style syntax in our tests
// so we can do things like `(1 + 1).should.equal(2);`
// http://chaijs.com/api/bdd/
const should = chai.should();

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

describe('Recipes', function() {
  before(function() {
    return runServer();
  });
  after(function() {
    return closeServer();
  });
  //GET test
  it('should list all Recipe items in GET request', function() {
    return chai.request(app)
    .get('/recipes')
    .then(function(res) {
      res.should.have.status(200);
      res.should.be.json;
      res.body.should.be.a('array');
      res.body.length.should.be.at.least(1);
      const expectedKeys = ['id', 'name', 'ingredients'];
      res.body.forEach(function(item) {
        item.should.be.a('object');
        item.should.include.keys(expectedKeys);
      });
    });
  });
  //POST test
  it('should add Recipe items in POST request', function() {
    const newItem = {name: 'lemonade', ingredients: ['lemons', 'water', 'sugar']};
    return chai.request(app)
    .post('/recipes')
    .send(newItem)
    .then(function(res) {
      res.should.have.status(201);
      res.should.be.json;
      res.body.should.be.a('object');
      res.body.should.include.keys('id', 'name', 'ingredients');
      res.body.id.should.not.be.null;
      res.body.ingredients.should.be.a('array');
      res.body.should.deep.equal(Object.assign(newItem, {id: res.body.id}));
    });
  });
  //PUT test
  it('should update Recipe items in PUT request',function() {
    const updateData = {
      name: 'cookies',
      ingredients: ['dough', 'oven']
    };
    return chai.request(app)
    .get('/recipes')
    .then(function(res) {
      updateData.id = res.body[0].id;
      return chai.request(app)
      .put(`/recipes/${updateData.id}`)
      .send(updateData);
    })
    .then(function(res) {
      res.should.have.status(200);
      res.should.be.a('object');
      res.body.should.deep.equal(updateData);
    });
  });
  //DELETE test
  it('should remove Recipe items in DELETE request', function() {
    return chai.request(app)
    .get('/recipes')
    .then(function(res) {
      return chai.request(app)
      .delete(`/recipes/${res.body[0].id}`);
    })
    .then(function(res) {
      res.should.have.status(204);
    });
  });
});