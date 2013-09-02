
var HelloWorld = Backbone.View.extend({
  el: $('#container'),
  // template which has the placeholder 'who' to be substitute later 
  template: _.template("<h4>Hello <%= who %>, have a nice <%= what %>!<h4>"),
  initialize: function(){
    this.render();
  },
  render: function(){
    // render the function using substituting the varible 'who' for 'world!'. 
    this.$el.html(this.template({who: 'world', what: 'day'}));
    //***Try putting your name instead of world.
  }
});

var helloWorld = new HelloWorld();

// todo list example

    var app = {}; // create namespace for our app
    
    //--------------
    // Models
    //--------------
    app.Todo = Backbone.Model.extend({
      defaults: {
        title: '',
        completed: false
      },
      toggle: function(){
        this.save({ completed: !this.get('completed')});
      }
    });

    //--------------
    // Collections
    //--------------
    app.TodoList = Backbone.Collection.extend({
      model: app.Todo,
      localStorage: new Store("backbone-todo")
    });

    // instance of the Collection
    app.todoList = new app.TodoList();

    //--------------
    // Views
    //--------------
    
    // renders individual todo items list (li)
    app.TodoView = Backbone.View.extend({
      tagName: 'tr',
      className: 'answer',
      template: _.template($('#item-template').html()),
      render: function(){
        this.$el.html(this.template(this.model.toJSON()));
        this.input = this.$('.edit');
        return this; // enable chained calls
      },
      initialize: function(){
        this.model.on('change', this.render, this);
        this.model.on('destroy', this.remove, this); // remove: Convenience Backbone's function for removing the view from the DOM.
      },      
      events: {
        'dblclick label' : 'edit',
        'keypress .edit' : 'updateOnEnter',
        'blur .edit' : 'close',
        'click .toggle': 'toggleCompleted',
        'click .destroy': 'destroy'
      },
      edit: function(){
        this.$el.addClass('editing');
        this.input.focus();
      },
      close: function(){
        var value = this.input.val().trim();
        if(value) {
          this.model.save({title: value});
        }
        this.$el.removeClass('editing');
      },
      updateOnEnter: function(e){
        if(e.which == 13){
          this.close();
        }
      },
      toggleCompleted: function(){
        this.model.toggle();
      },
      destroy: function(){
        this.model.destroy();
      }      
    });

    // renders the full list of todo items calling TodoView for each one.
    app.AppView = Backbone.View.extend({
      el: '#todoapp',
      initialize: function () {
        this.input = this.$('#new-todo');
        app.todoList.on('add', this.addAll, this);
        app.todoList.on('reset', this.addAll, this);
        app.todoList.fetch(); // Loads list from local storage
      },
      events: {
        'keypress #new-todo': 'createTodoOnEnter'
      },
      createTodoOnEnter: function(e){
        if ( e.which !== 13 || !this.input.val().trim() ) { // ENTER_KEY = 13
          return;
        }
        app.todoList.create(this.newAttributes());
        this.input.val(''); // clean input box
      },
      addOne: function(todo){
        var view = new app.TodoView({model: todo});
        $('#todo-list').append(view.render().el);
      },
      addAll: function(){
        this.$('#todo-list').html(''); // clean the todo list
        app.todoList.each(this.addOne, this);
      },
      newAttributes: function(){
        return {
          title: this.input.val().trim(),
          completed: false
        }
      }
    });

    //--------------
    // Initializers
    //--------------   

    app.appView = new app.AppView(); 

// ==========================================================================

$(function(){

  Backbone.sync = function(method, model, success, error){
    success();
  }

  // model
  var Item = Backbone.Model.extend({
    defaults: {
      part1: 'Hello',
      part2: 'World',
      number: null,
    }
  });

  // Collection
  var List = Backbone.Collection.extend({
    model: Item
  });

  // dedicated view to the line that is added
  var ItemView = Backbone.View.extend({
    tagName: 'li',
    template: _.template('<span><%= par1 %> <%= par2 %>! Number <%= num %>!</span> &nbsp; &nbsp; <span class="swap" style="font-family:sans-serif; color:blue; cursor:pointer;">[swap]</span> <span class="delete" style="cursor:pointer; color:red; font-family:sans-serif;">[delete]</span>'),

    events: {
      'click span.swap': 'swap',
      'click span.delete': 'remove'
    },

    initialize: function(){
      _.bindAll(this, 'render', 'unrender', 'swap', 'remove');

      this.model.bind('change', this.render);
      this.model.bind('remove', this.unrender);
    },

    render: function(){
      $(this.el).html(this.template({
        par1: this.model.get('part1'), 
        par2: this.model.get('part2'), 
        num: this.model.get('number') 
      }));
      return this;
    },

    unrender: function(){
      $(this.el).remove();
    },
    swap: function(){
      var swapped = {
        part1: this.model.get('part2'),
        part2: this.model.get('part1'),
      };
      this.model.set(swapped);
    },
    remove: function(){
      this.model.destroy();
    }
  });

  // view
  var ListView = Backbone.View.extend({
    el: $('#content'),
    events: {
      'click button#add' : 'addItem'
    },

    initialize: function(){
      _.bindAll(this,'render', 'addItem', 'appendItem');
      
      this.collection = new List(); //creates new instance of collection
      this.collection.bind('add', this.appendItem); //bind 'add' event listener to the collection

      this.counter = 0;
      this.render();
    },
    render: function(){

      var self = this;

      $(this.el).append('<button id="add">Add list item</button>');
      $(this.el).append('<ul></ul>');

      _(this.collection.models).each(function(item){
        self.appendItem(item);
      },this);
    },

    addItem: function(){
      this.counter++;
      var item = new Item(); //creates new instance of model
      item.set({
        number: this.counter, //change default value
      });
      this.collection.add(item); //add item to collection
    },

    appendItem: function(item){
      var itemView = new ItemView({
        model: item
      });

      $('ul', this.el).append(itemView.render().el);
    }
  });

  var listView = new ListView();

});
