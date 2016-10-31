"use strict";

var ReactLoginThis = null;
var ReactRegisterThis = null;
var ReactResetThis = null;

$(document).ready(function() {
    //localStorage.removeItem("user_logged_in");
    //localStorage.removeItem("user_picture");

    var login_html = "";
    if (localStorage.getItem("user_picture") != null) {
        login_html += "<img alt=\"\" width=\"20px\" src=\"" + localStorage.getItem("user_picture") + "\">  ";
    }

    if (localStorage.getItem("user_logged_in") != null)
        login_html += "User: " + localStorage.getItem("user_logged_in");

    console.log(login_html);

    $("#username_display").html(login_html);
});

$('#submit').click(function() {
    //USER IS LOGGING IN
    if ($(this).data('page') === "login") {
        var email = $('#email').val();
        var pass = $('#password').val();

        /* $.get("http://localhost:3000/database",{email: email, pass: pass}, function(data, status){
					ReactLoginThis.setState({login: data});					
				}); */
        $.get("/database", {
            email: email,
            pass: pass
        }, function(data, status) {

            console.log("data " + data);
            var worked;
            if (data === "fail")
                worked = "fail";
            else {
                worked = "true";
                localStorage.setItem("user_logged_in", email);
                localStorage.setItem("user_picture", data);
                console.log(data);

                var login_html = "<img alt=\"profile_pic\" width=\"20px\" src=\"" + data + "\">  " +
                    "User: " + localStorage.getItem("user_logged_in");

                $("#username_display").html(login_html);
            }

            ReactLoginThis.setState({
                login: worked
            });

        });

    }
    // USER IS REGISTERING
    else if ($(this).data('page') === "register") {
        var first = $('#first').val();
        var last = $('#last').val();
        var pass = $('#password').val();
        var email = $('#email').val();
        var dob = $('#dob').val();
        var image = $('#image_file').val();

        //console.log("IMAGE: "+img);

        if (first == "" || pass == "" || last == "" || email == "" || dob == "" || image == "") {
            $('#register').html("Must fill out all fields");
            $('#register').show();
        } else {

            var formData = new FormData($("#regForm")[0]);
            console.log(formData);
            $.ajax({
                type: "POST",
                url: "/upload",
                data: formData,
                processData: false,
                contentType: false
            }).done(function(data) {
                console.log(data);
                ReactRegisterThis.setState({
                    register: data
                });
            });
        }
    } else if ($(this).data('page') === "reset") {

        var email = $('#email').val();
        var pass = $('#password').val();
        var new_pass = $('#new_password').val();

        $.ajax({
            url: "/database",
            type: 'PUT',
            data: {
                email: email,
                pass: pass,
                newPass: new_pass
            },
            success: function(data, status) {
                ReactResetThis.setState({
                    reset: data
                });
            }
        });
    }
});

$('#clear_login_form').click(function() {
    $('#email').val("");
    $('#password').val("");
    $('#login').hide();
    ReactLoginThis.setState({
        login: ""
    });
});

$('#clear_register_form').click(function() {
    $('#first').val("");
    $('#last').val("");
    $('#password').val("");
    $('#email').val("");
    $('#dob').val("");
    $('#register').hide();
    ReactRegisterThis.setState({
        register: ""
    });
});

$('#clear_reset_form').click(function() {
    $('#email').val("");
    $('#password').val("");
    $('#new_password').val("");
    $('#register').hide();
    ReactResetThis.setState({
        reset: ""
    });
});