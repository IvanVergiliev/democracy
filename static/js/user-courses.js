/* courses tabs */
$('#coursesTab a[href="#not-enrolled"]').tab('show');
$('#coursesTab a').click(function(e) {
    e.preventDefault();
    $(this).tab('show');
});

/* clone reCAPTCHA */
$(function() {
    $('#firstReCAPTCHA').html($('#originalReCAPTCHA').clone(true, true));
    $('#secondReCAPTCHA').html($('#originalReCAPTCHA').clone(true, true));
});

$('.showDescription').click(function() {
  $.get('templates/course_info.ejs', function (txt) {
    $('.modal').html(txt);
    $('#info-linux-sys-admin').modal('show');
  });
});

$('.showEnroll').click(function() {
  var id = this.dataset.id;
  $.get('templates/enroll.ejs', function (txt) {
    $('.modal').html(ejs.render(txt, {_id: id}));
    $('#firstReCAPTCHA').html($('#originalReCAPTCHA').clone(true, true));
    $('#info-linux-sys-admin').modal('show');
  });
});

$('body').on('click', '.enroll', function () {
  var id = this.dataset.id;
  $.ajax({
    type: 'post',
    url: 'enroll',
    data: {
      courseId: id
    },
    success: function (json) {
      if (json.result) {
        $('.enrollResult').html('Готово!');
      } else {
        $('.enrollResult').html(json.msg);
      }
      $('.enrollResult').show();
    }
  });
});
