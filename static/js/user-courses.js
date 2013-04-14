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

$('body').on('click', '.unenroll', function() {
  var id = this.dataset.id;
  $.ajax({
    type: 'get',
    url: 'unenroll/' + id,
    success: function (json) {
      if (json.result) {
        $('.unenrollStatus').html('Отписан!');
        $('a[data-id=' + id + '].showEnroll').show();
        $('a[data-id=' + id + '].unenroll').hide();
      }
    }
  });
  return false;
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
        $('a[data-id=' + id + '].unenroll').show();
        $('a[data-id=' + id + '].showEnroll').hide();
        $('a[data-id=' + id + '].enroll').hide();
      } else {
        $('.enrollResult').html(json.msg);
      }
      $('.enrollResult').show();
    }
  });
  return false;
});

$('body').on('click', '.enqueue', function () {
  var id = this.dataset.id;
  $.ajax({
    type: 'get',
    url: 'enqueue/' + id,
    success: function (json) {
      if (json.result) {
        $('a[data-id=' + id + '].enqueue').hide();
        $('a[data-id=' + id + '].dequeue').show();
      }
    }
  });
  return false;
});

$('body').on('click', '.dequeue', function () {
  var id = this.dataset.id;
  $.ajax({
    type: 'get',
    url: 'dequeue/' + id,
    success: function (json) {
      if (json.result) {
        $('a[data-id=' + id + '].dequeue').hide();
        $('a[data-id=' + id + '].enqueue').show();
      }
    }
  });
  return false;
});

var filterRows = function (query) {
  $('.showDescription').each(function (index, item) {
    if (item.innerHTML.indexOf(query) == -1) {
      $(item).parent().parent().hide();
    } else {
      $(item).parent().parent().show();
    }
  });
};

$('#filter').keyup(function () {
  filterRows(this.value);
});
