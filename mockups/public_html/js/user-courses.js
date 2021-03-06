/* courses tabs */
$('#coursesTab a[href="#not-enrolled"]').tab('show');
$('#coursesTab a').click(function(e) {
    e.preventDefault();
    $(this).tab('show');
});

/* tooltips */
$('#all-courses').tooltip({
    selector: "a[data-toggle=tooltip]"
});

/* clone reCAPTCHA */
$(function() {
    $('#firstReCAPTCHA').html($('#originalReCAPTCHA').clone(true, true));
    $('#secondReCAPTCHA').html($('#originalReCAPTCHA').clone(true, true));
});