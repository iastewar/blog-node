$(function() {

  $("#new_post_btn").on("click", function(e) {
    if ($("#log_out_btn").length !== 0) {
      if ($("#creating_new_post").length === 0) {
        $.get("/posts/new", function(data) {
          $("#new_post_form").append(data);
          $("#creating_new_post").slideDown();
        });
      } else {
        $("#creating_new_post").slideUp(function() {
          this.remove();
        });
      }
      e.preventDefault();
    }
  });







});
