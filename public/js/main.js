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
    var course_selected = $("#newCard #courses").find(":selected").val();
    var username = $("#newCard #player").val();
    var level = $("#newCard #level").find(":selected").val();
    var row_id = username + "-row";
    var table_id = username + "ScoreCard";

    await fetch(golfCourses[course_selected]).then((response) => response.json()).then((data) => {
        $("#newPlayerModal").modal("hide");
        $(".score-row").removeClass("d-none");
        data = data.data;

        $(".score-row > div").append("<div class='row' id='"+ row_id +"'></div>");

        $(".score-row > div #" + row_id).append(
                "<div class='col-12 col-insert-1'>"+
                    "<table class='table table-dark' id='"+table_id+"'>"+
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
                            "<tr id='playerScore'>" +
                                "<td id='username'></td>" +
                            "</tr>" +
                        "</tbody>" +
                    "</table>"+
                "</div>" +
                "<div class='col-12 col-insert-2 d-none'>"+
                    "<table class='table table-dark' id='"+table_id+"'>"+
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
                            "<tr id='playerScore'>" +
                                "<td id='username'></td>" +
                            "</tr>" +
                        "</tbody>" +
                    "</table>"+
                "</div>"
        );

        $("#"+table_id+" #username").text(username);

        var count = 1;

        for (hole of data.holes) {
            // var insert_col = (count <= 9) ? "col-insert-1" : "col-insert-2";

            if (count <= 9) {
                var insert_col = "col-insert-1";
            } else if (count === 10) {
                $("."+ insert_col +" #"+table_id+" #holes").append("<td>In</td>");
                $("."+ insert_col +" #"+table_id+" #yardages").append("<td>"+ totals["yardage"] +"</td>");
                $("."+ insert_col +" #"+table_id+" #pars").append("<td>"+ totals["par"] +"</td>");
                $("."+ insert_col +" #"+table_id+" #handicaps").append("<td>"+ totals["handicap"] +"</td>");
                $("." + insert_col + " #"+table_id+ " #playerScore").append("<td id='col_insert_1'></td>");
                var insert_col = "col-insert-2";
            }

            $("." + insert_col + " #"+table_id+ " #holes").append("<td>"+ hole.hole +"</td>");
            
            var level_data = hole.teeBoxes.find((type) => type.teeType == level);
            
            totals["yardage"] += level_data.yards;
            totals["par"] += level_data.par;
            totals["handicap"] += level_data.hcp;
            
            $("." + insert_col + " #"+table_id+ " #yardages").append("<td>"+ level_data.yards +"</td>");
            $("." + insert_col + " #"+table_id+ " #pars").append("<td>"+ level_data.par +"</td>");
            $("." + insert_col + " #"+table_id+ " #handicaps").append("<td>"+ level_data.hcp +"</td>");

            var input_insert = (count == 1 || count == 10) ? "<td><input type='text' class='form-control score-counter' id='"+ username +"_score_"+ count +"' onkeypress='markingScore()' onchange='calculateScore()'></td>" : "<td><input type='text' class='form-control score-counter' id='"+ username +"_score_"+ count +"' onkeypress='markingScore()' onchange='calculateScore()' disabled></td>";

            $("." + insert_col + " #"+table_id+ " #playerScore").append(input_insert);
            
            count++;
            
        }

        $("."+ insert_col +" #"+table_id+" #holes").append("<td>Out</td>");
        $("."+ insert_col +" #"+table_id+" #yardages").append("<td>"+ totals["yardage"] +"</td>");
        $("."+ insert_col +" #"+table_id+" #pars").append("<td>"+ totals["par"] +"</td>");
        $("."+ insert_col +" #"+table_id+" #handicaps").append("<td>"+ totals["handicap"] +"</td>");
        $("." + insert_col + " #"+table_id+ " #playerScore").append("<td id='col_insert_2'></td>");

    });

    $("#courses").prop('selectedIndex', 0);
    $("#player").val("");
    $("#level").prop('selectedIndex', 0);

    $("#level_row").addClass("d-none");
    $("#level").empty().append('<option value="">Select Level</option>');

});

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
    let key_press = event.currentTarget.value;
    let current_score = event.currentTarget.id;
    let current_table = $(event.currentTarget).parents("table")[0];
    let score_data = current_score.split("_");
    let table_total = (score_data[2] <= 9) ? "#col_insert_1" : "#col_insert_2";

    if (score_data[2] == 9) {
        // $("#" + score_data[0] + "-row").find(".col-insert-1").removeClass("col-12").addClass("col-6");
        // $("#" + score_data[0] + "-row").find(".col-insert-2").removeClass("col-12").addClass("col-6");
        $("#" + score_data[0] + "-row").find(".col-insert-2").removeClass("d-none");
    } else {
        $(current_table).find("#"+ score_data[0] +"_score_" + (parseInt(score_data[2]) + 1)).prop("disabled", false);
    }

    if ($("#" + score_data[0] + "-row").find(table_total).text() == '') {
        $("#" + score_data[0] + "-row").find(table_total).text(parseInt(event.currentTarget.value));
    } else {
        var current_total = $("#" + score_data[0] + "-row").find(table_total).text();
        $("#" + score_data[0] + "-row").find(table_total).text(parseInt(current_total) + parseInt(event.currentTarget.value));
    }
    $(event.currentTarget).prop("disabled", true);
}

function checkUser() {
    var username = event.currentTarget.value;
    if (users_playing.includes(username)) {
        $("#createNewCard").prop("disabled", true);
    } else {
        $("#createNewCard").prop("disabled", false);
    }
}

$(document).ready(() => {
    $("#newPlayerModal").modal("show");
});