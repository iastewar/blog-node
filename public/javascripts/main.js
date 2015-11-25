$(function() {

  $("#new_post_btn").on("click", function(e) {
      if ($("#creating_new_post").length === 0) {
        $.ajax({
          url: "/posts/new",
          success:
            function(data, status, xhr) {
               $("#new_post_form").append(data);
               $("#creating_new_post").slideDown();
          },
          statusCode: {
            403: function() {
              window.location = "/users/login";
            }
          }
        });
      } else {
        $("#creating_new_post").slideUp(function() {
          this.remove();
        });
      }
      e.preventDefault();
  });







});
