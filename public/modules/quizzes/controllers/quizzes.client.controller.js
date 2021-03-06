'use strict';


angular.module('quizzes').controller('QuizController', ['$scope', 'QuizService', '$stateParams', '$location', 'Authentication', 'QuestionService', '$modal', function($scope, QuizService, $stateParams, $location, Authentication, QuestionService, $modal){
    $scope.user = Authentication.user;

        // Create Quiz Function
        $scope.createQuiz = function(){
            
            var quiz = new QuizService({
                quizName: this.quizName,
                category: this.category,
                description: this.description,
            });
            quiz.$save(function(response){
                $scope.quizId = response._id;
                $scope.quizSlug = response.slug;
                for (var j = 0; j < $scope.questionOptions.length; j++) {
                        if($scope.questionOptions[j] === undefined){
                            $scope.questionOptions.splice(j, 1);
                        }
                    }
            for (var i = 0; i < $scope.questionArray.length; i++) {
                var question =  new QuestionService({
                    quizId: response._id,
                    question: $scope.questionArray[i].question,
                    questionOptions: $scope.questionArray[i].questionOptions,
                    answer: $scope.questionArray[i].answer
                });
                question.$save();
                $scope.done = true;
            }
                
                $scope.$watch(function(){
                    if($scope.done){
                        $location.path('/quiz/' + ($scope.quizSlug !== '') ? $scope.quizSlug : $scope.quizId);
                    }
                });
            }, function(errorResponse){
                $scope.error = errorResponse.data.message;
            });
        };

        // Retrieves Quiz
        $scope.getQuiz = function(){
            $scope.quiz = QuizService.get({ quizId: $stateParams.quizId },
                function(response){
                    // Check if curent user is the quiz author
                    if($scope.quiz.user && $scope.user){
                        if($scope.quiz.user._id === $scope.user._id){
                            $scope.isAuthor = true;
                        }
                    }
                    
                }, function(err){
                    console.log(err);
                });            
        };

        // Retrieves Quizzes
        $scope.listQuizzes = function(){
            $scope.quizzes = QuizService.query();
        };

        // Removes quiz and deletes from schema
        $scope.removeQuiz =  function(){
            if(confirm('Are you sure you want to delete this quiz? This action cannot be undone!')){
                $scope.quiz.$remove(function(){
                    $location.path('quizzes');
                });
            }
        };

        // Removes question from quiz and also deletes from schema
        $scope.remove = function(quiz){
            if(confirm('Are you sure you want to delete this question? This action cannot be undone!')){
                var question = $scope.quiz.questions[this.$index];
                $scope.quiz.questions.splice(this.$index, 1);
                QuestionService.delete({
                    quizId: $stateParams.quizId,
                    questionId: question._id
                }, {
                    
                }, function(response){

                }, function(error){

                });
            }        
        };

        // Load add-question modal form
        $scope.loadForm = function(){
            var modalInstance = $modal.open({
                templateUrl: 'modules/questions/views/_add-question-form.client.view.html',
                controller: 'LoadFormCtrl',
                resolve: {
                    question: function () {
                      return  {
                            question: $scope.question,
                            questionOptions: $scope.questionOptions,
                            answer: $scope.answer
                        };
                    }
                }
            });
        };

        // Load edit-quiz modal form
        $scope.editQuiz = function(){
            var modalInstance = $modal.open({
                templateUrl: 'modules/quizzes/views/_edit-quiz-form.client.view.html',
                controller: 'LoadEditQuizFormCtrl',
                size: '',
                resolve: {
                    question: function () {
                      return  {
                            quizName: $scope.quizName,
                            description: $scope.description,
                            category: $scope.category
                        };
                    }
                }
            });
        };

        // Starts quiz
        $scope.takeQuiz = function(){
            $scope.takethequiz = true;
        };


        $scope.share = function(){
            FB.ui({
                method: 'share',
                href: $location.absUrl()
            }, function(response){});
        };

        

}]).controller('LoadFormCtrl', ['$scope', '$window', 'AddOption', '$compile', '$stateParams', 'QuestionService', '$modalInstance',  function($scope, $window, AddOption, $compile, $stateParams, QuestionService, $modalInstance){
    $scope.index = 1;
    $scope.addOption = function(){
        return AddOption.addOption($scope, $compile);
    };

    $scope.questionOptions = [];

    $scope.postQuestion = function(){
        var questionObj =  new QuestionService({
            quizId: $stateParams.quizId,
            question: $scope.question,
            questionOptions: $scope.questionOptions,
            answer: $scope.answer
        });
        questionObj.$save(function(response){
            $window.location.reload();
        });
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}]).controller('LoadEditQuizFormCtrl', ['$scope', 'QuizService', '$modalInstance', '$location', '$window', '$stateParams', function($scope, QuizService, $modalInstance, $location, $window, $stateParams){
    $scope.quiz = QuizService.get({quizId: $stateParams.quizId}); 

    $scope.postQuiz = function(){
        var quiz = $scope.quiz;

        quiz.$update(function(){
            var link = ($scope.quiz.slug !== '') ? $scope.quiz.slug : $scope.quiz._id;
            $modalInstance.close();
            if($location.path() === ('/quiz/' + link)){
                $window.location.reload();
            } else {
                $location.path('/quiz/' + link);
            }
        }, function(error){
            
        });
    };


    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };    
}]);