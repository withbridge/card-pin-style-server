jQuery(function ($) {
    // Will allow us to set placeholder via css
    var pinText = window.getComputedStyle($('#ctl-set-pin-placeholder-text')[0], ':before').content.replace(/"/g, "");
    $('#ctl-set-pin').attr('placeholder', pinText);
    var confirmText = window.getComputedStyle($('#ctl-confirm-set-pin-placeholder-text')[0], ':before').content.replace(/"/g, "");
    $('#ctl-confirm-set-pin').attr('placeholder', confirmText);

    $('form').on('submit', function(e) {
        $('#btn-submit').attr('disabled', 'disabled');
    });

});

$(document).ready(function(){
    $('input[type=password]').on('change invalid', function() {
        var textfield = $(this).get(0);
        var str = document.documentElement.lang;

        textfield.setCustomValidity('');
        if (!textfield.validity.valid) {
          if (str ==='es') {
              textfield.setCustomValidity('Por favor, coincida con el formato solicitado.');
          } else if (str === 'pt') {
              textfield.setCustomValidity('Por favor, siga o formato solicitado.');
          } else if (str === 'fr') {
              textfield.setCustomValidity('Le format doit correspondre à celui demandé.')
          } else {
              textfield.setCustomValidity('Please match the format requested.');
          }
        }
    });
});
