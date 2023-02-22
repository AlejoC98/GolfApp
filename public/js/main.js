const golfCourses = {
    11819: "http://uxcobra.com/golfapi/course11819.txt",
    18300: "http://uxcobra.com/golfapi/course18300.txt", 
    19002: "http://uxcobra.com/golfapi/course19002.txt"
}

let totals = {
    "yardage": 0,
    "par": 0,
    "handicap": 0,
};

let users_playing = [];

let new_user_status = undefined;

$("#courses").on("change", async() => {
    var course = $(event.target).find(":selected").val();
    var levels = [];

    $("#level_row").addClass("d-none");
    $("#level").empty().append('<option value="">Select Level</option>');

    await fetch(golfCourses[course]).then((result) => result.json()).then((res) => {
        for (hole of res.data.holes) {
            hole.teeBoxes.find((type) => {
                if (!levels.includes(type.teeType) && type.teeType != "auto change location")
                    levels.push(type.teeType);
            });
        }
    });

    if (levels.length > 0) {
        $("#level_row").removeClass("d-none");
        for (var level of levels) {
            var level_name = level.charAt(0).toUpperCase() + level.slice(1);
            $("#level").append('<option value="'+level+'">'+ level_name +'</option>');
        }
    }

});

$("#newCard").on("submit", async() => {
    event.preventDefault();
    var course_selected = $("#" + event.currentTarget.id + " #courses").find(":selected").val();
    var username = $("#" + event.currentTarget.id + " #player").val();
    var level = $("#" + event.currentTarget.id + " #level").find(":selected").val();
    var row_id = username + "-row";

    switch (event.currentTarget.id) {
        case "addNewUser":

            if (new_user_status == true) {
                $(".col-insert-1 table tbody, .col-insert-2 table tbody").append("<tr id='" + username + "Score' class='playerScore'><td id='username'>"+ username +"</td></tr>");

                $("#newPlayerModal").modal("hide");
                
                for (let index = 1; index < 19; index++) {

                    var insert_row = (index <= 9) ? ".col-insert-1" : ".col-insert-2";

                    console.log("Sociooo", index);
                    var input_insert = (index == 1 || index == 10) ? "<td><input type='text' class='form-control score-counter' id='"+ username +"_score_"+ index +"' onkeypress='markingScore()' onchange='calculateScore()'></td>" : "<td><input type='text' class='form-control score-counter' id='"+ username +"_score_"+ index +"' onkeypress='markingScore()' onchange='calculateScore()' disabled></td>";
            
                    $(insert_row + " table #" + username + "Score").append(input_insert);

                    switch (index) {
                        case 9:
                            $(insert_row + " table #" + username + "Score").append("<td id='" + username + "_total_1'></td>");
                            break;
                        case 18:
                            $(insert_row + " table #" + username + "Score").append("<td id='" + username + "_total_2'></td>");
                            break;
                    }
                }
            }

            break;
    
        default:
            await fetch(golfCourses[course_selected]).then((response) => response.json()).then((data) => {
                $("#newPlayerModal").modal("hide");
                $(".score-row").removeClass("d-none");
                data = data.data;
        
                $(".score-row > div").append("<div class='row' id='"+ row_id +"'></div>");
        
                $(".score-row > div #" + row_id).append(
                        "<div class='col-12 col-insert-1'>"+
                            "<table class='table table-dark'>"+
                                "<tbody>"+
                                    "<tr id='holes'>" +
                                        "<td>Hole</td>" +
                                    "</tr>" +
                                    "<tr id='yardages'>" +
                                        "<td>Yardage</td>" +
                                    "</tr>" +
                                    "<tr id='pars'>" +
                                        "<td>Par</td>" +
                                    "</tr>" +
                                    "<tr id='handicaps'>" +
                                        "<td>Handicap</td>" +
                                    "</tr>" +
                                    "<tr id='"+ username +"Score' class='playerScore'>" +
                                        "<td id='username'>"+ username +"</td>" +
                                    "</tr>" +
                                "</tbody>" +
                            "</table>"+
                        "</div>" +
                        "<div class='col-12 col-insert-2 d-none'>"+
                            "<table class='table table-dark'>"+
                                "<tbody>"+
                                    "<tr id='holes'>" +
                                        "<td>Hole</td>" +
                                    "</tr>" +
                                    "<tr id='yardages'>" +
                                        "<td>Yardage</td>" +
                                    "</tr>" +
                                    "<tr id='pars'>" +
                                        "<td>Par</td>" +
                                    "</tr>" +
                                    "<tr id='handicaps'>" +
                                        "<td>Handicap</td>" +
                                    "</tr>" +
                                    "<tr id='"+ username +"Score' class='playerScore'>" +
                                        "<td id='username'>"+ username +"</td>" +
                                    "</tr>" +
                                "</tbody>" +
                            "</table>"+
                        "</div>"
                );

                var count = 1;
        
                for (hole of data.holes) {
        
                    if (count <= 9) {
                        var insert_col = "col-insert-1";
                    } else if (count === 10) {
                        $("."+ insert_col +" table #holes").append("<td>In</td>");
                        $("."+ insert_col +" table #yardages").append("<td>"+ totals["yardage"] +"</td>");
                        $("."+ insert_col +" table #pars").append("<td>"+ totals["par"] +"</td>");
                        $("."+ insert_col +" table #handicaps").append("<td>"+ totals["handicap"] +"</td>");
                        $("." + insert_col + " table #"+ username +"Score").append("<td id='" + username + "_total_1'></td>");
                        var insert_col = "col-insert-2";
                    }
        
                    $("." + insert_col + " table #holes").append("<td>"+ hole.hole +"</td>");
                    
                    var level_data = hole.teeBoxes.find((type) => type.teeType == level);
                    
                    totals["yardage"] += level_data.yards;
                    totals["par"] += level_data.par;
                    totals["handicap"] += level_data.hcp;
                    
                    $("." + insert_col + " table #yardages").append("<td>"+ level_data.yards +"</td>");
                    $("." + insert_col + " table #pars").append("<td>"+ level_data.par +"</td>");
                    $("." + insert_col + " table #handicaps").append("<td>"+ level_data.hcp +"</td>");
        
                    var input_insert = (count == 1 || count == 10) ? "<td><input type='text' class='form-control score-counter' id='"+ username +"_score_"+ count +"' onkeypress='markingScore()' onchange='calculateScore()'></td>" : "<td><input type='text' class='form-control score-counter' id='"+ username +"_score_"+ count +"' onkeypress='markingScore()' onchange='calculateScore()' disabled></td>";
        
                    $("." + insert_col + " table #"+ username +"Score").append(input_insert);
                    
                    count++;
                    
                }
        
                $("."+ insert_col +" table #holes").append("<td>Out</td>");
                $("."+ insert_col +" table #yardages").append("<td>"+ totals["yardage"] +"</td>");
                $("."+ insert_col +" table #pars").append("<td>"+ totals["par"] +"</td>");
                $("."+ insert_col +" table #handicaps").append("<td>"+ totals["handicap"] +"</td>");
                $("." + insert_col + " table #"+ username +"Score").append("<td id='" + username + "_total_2'></td>");
        
            }).catch((err) => {
                alertMesssage('', err, "danger");
            });
        
            $("#courses").prop('selectedIndex', 0);
            $("#level").prop('selectedIndex', 0);
        
            $("#level_row").addClass("d-none");
            $("#level").empty().append('<option value="">Select Level</option>');
            break;
    }

    $("#player").val("");

});

function newPlayer() {
    $("#courses_row").remove();
    $("#level_row").remove();

    $("#newCard").attr("id", "addNewUser");
}

function markingScore() {
    let key_press = event.key;
    // let current_score = event.currentTarget.id;
    // let current_table = $(event.currentTarget).parents("table")[0];
    // let score_data = current_score.split("_");
    // let table_total = (score_data[2] <= 9) ? "#col_insert_1" : "#col_insert_2";
    
    if (/^[A-Za-z]*$/.test(key_press) == true || key_press == ' ') {
        event.preventDefault();
    }
}

function calculateScore() {
    // let key_press = event.currentTarget.value;
    let current_score = event.currentTarget.id;
    let current_table = $(event.currentTarget).parents("table")[0];
    let score_data = current_score.split("_");
    let table_total = (score_data[2] <= 9) ? "#"+ score_data[0] +"_total_1" : "#"+ score_data[0] +"_total_2";

    if ($("table").find(table_total).text() == '') {
        $("table").find(table_total).text(parseInt(event.currentTarget.value));
    } else {
        var current_total = $("table").find(table_total).text();
        $("table").find(table_total).text(parseInt(current_total) + parseInt(event.currentTarget.value));
    }

    if (score_data[2] == 9) {
        $("table").find(".col-insert-2").removeClass("d-none");
        $("#" + score_data[0] + "_total_2").text($("table").find(table_total).text());
    } else if (score_data[2] == 18) {
        alertMesssage('', `${score_data[0]} you are (L)PGA Tour material!`, 'success');
    } else {
        $(current_table).find("#"+ score_data[0] +"_score_" + (parseInt(score_data[2]) + 1)).prop("disabled", false);
    }

    // $(event.currentTarget).prop("disabled", true);
    $(event.currentTarget).parents("td").html(event.currentTarget.value);
}

function checkUser(username = event.currentTarget.value) {
    // var username = event.currentTarget.value;
    if (users_playing.includes(username)) {
        $("#createNewCard").prop("disabled", true);
        alertMesssage('User already exist!', 'Please try a different one', 'warning');
        new_user_status = false;
    } else if (username != undefined){
        $("#createNewCard").prop("disabled", false);
        users_playing.push(username);
        new_user_status = true;
    }
}

function alertMesssage(strong, ms, type) {
    var alert_ele =  '<div class="alert alert-'+ type +' alert-dismissible fade show animate__animated animate__slideInRight" role="alert">' +
        '<strong>'+ strong +'</strong> ' + ms +
        '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>' +
    '</div>';

    $(".container-alert").css("display", "block");
    $(".container-alert").prepend(alert_ele);
    
    setTimeout(() => {
        $(".container-alert").css("display", "none");
        $(".container-alert").remove(alert_ele);
    }, 5000);

    // $("main").prepend(alert_ele);
    // $("main").append(alert_ele);
}

$(document).ready(() => {
    $("#newPlayerModal").modal("show");
});