// app quiz example

$(function(){

  var app = {};

  app.Answer = Backbone.Model.extend({
    defaults: {
      title: 'Your answer here',
      isAnswer: false,
      number: 0
    }
  });

  // var answer = new app.Answer();

  app.AnswerList = Backbone.Collection.extend({
    model: app.Answer,
    localStorage: new Store("backbone-answers")
  });

  // instance of the Collection
  app.answerList = new app.AnswerList();

  app.AnswerView = Backbone.View.extend({
    tagName: 'tr',
    className: 'answer',
    template: _.template($('#answer-template').html()),

    events: {
      'click button.destroy': 'destroy',
      'change input.answer-edit' : 'updateLabel',
      'click button.edit' : 'editLabel',
      'click button.save' : 'saveLabel',
      'change input.toggle': 'toggleAnswer',      
    },

    initialize: function(){
      _.bindAll(this, 'render','remove', 'unrender', 'updateLabel', 'editLabel', 'saveLabel','toggleAnswer');
      this.model.bind('change', this.render);
      this.model.bind('destroy', this.unrender);
      this.render();
    },
    render: function(){
      $(this.el).html(this.template(
        {
          title: this.model.get('title'), 
          isAnswer: this.model.get('isAnswer'), 
          number: this.model.get('number')
        }
      ));

      $(this.el).find('.answer-edit').hide();
      $(this.el).find('.save').hide();

      return this;
    },
    unrender: function(){
      // console.log('unrender');
      $(this.el).remove();
    },
    destroy: function(){
      // console.log('destroy');
      this.model.destroy();
    },
    editLabel: function(e){
      $(e.target).hide();
      $(this.el).find('.save').show();
      $(this.el).find('.answer-text').hide();
      $(this.el).find('.answer-edit').show();
    },
    updateLabel: function(e){
      var newText = $(e.target).val();
      this.model.set({title: newText});
    },
    saveLabel: function(e){
      $(e.target).hide();
      $(this.el).find('.edit').show();
      $(this.el).find('.answer-edit').hide();
      $(this.el).find('.answer-text').show();
    },
    toggleAnswer: function(e){
      if($(e.target).val() == 'on'){
        console.log($(e.target).val());
        this.model.set({ isAnswer: true });
      } else {
        this.model.set({ isAnswer: false });
      }
    }
  });


  app.AppView = Backbone.View.extend({
    el: $('#body'),

    events: {
      'click button#insert-button': 'addAnswer',
      'click button#get-answer': 'getAnswer',
    },

    initialize: function(){
      _.bindAll(this, 'addAnswer', 'getAnswer');

      this.collection = new app.AnswerList();
      this.counter = 0;
    },
    addAnswer: function(){
      this.counter++;
      var answer = new app.Answer();
      answer.set({
        number: this.counter
      });

      app.answerList.add(answer);

      var newAnswer = new app.AnswerView({model: answer});

      $('tbody',this.el).append(newAnswer.render().el);
    },
    getAnswer: function(){
      var theAnswer = app.answerList.where({isAnswer: true});
      var answr = {};
      _.each(theAnswer, function(item){
        answr = item.toJSON();
      });
      console.log(answr.title);
    }

  });

  app.appView = new app.AppView();

});
