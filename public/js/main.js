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
                "<div class='col-sm-12 col-md-12 col-lg-12 col-insert-1'>"+
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
                "<div class='col-sm-12 col-md-12 col-lg-12 col-insert-2 d-none'>"+
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
            }else if(count == 18) {
                $("."+ insert_col +" #"+table_id+" #holes").append("<td>Out</td>");
                $("."+ insert_col +" #"+table_id+" #yardages").append("<td>"+ totals["yardage"] +"</td>");
                $("."+ insert_col +" #"+table_id+" #pars").append("<td>"+ totals["par"] +"</td>");
                $("."+ insert_col +" #"+table_id+" #handicaps").append("<td>"+ totals["handicap"] +"</td>");
                $("." + insert_col + " #"+table_id+ " #playerScore").append("<td></td>");
            } else {
                $("."+ insert_col +" #"+table_id+" #holes").append("<td>Out</td>");
                $("."+ insert_col +" #"+table_id+" #yardages").append("<td>"+ totals["yardage"] +"</td>");
                $("."+ insert_col +" #"+table_id+" #pars").append("<td>"+ totals["par"] +"</td>");
                $("."+ insert_col +" #"+table_id+" #handicaps").append("<td>"+ totals["handicap"] +"</td>");
                $("." + insert_col + " #"+table_id+ " #playerScore").append("<td></td>");
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

            var input_insert = (count == 1 || count == 10) ? "<td><input type='text' class='form-control score-counter' id='score_"+ count +"' onkeypress='markingScore()'></td>" : "<td><input type='text' class='form-control score-counter' id='score_"+ count +"' onkeypress='markingScore()' disabled></td>";

            $("." + insert_col + " #"+table_id+ " #playerScore").append(input_insert);
            
            count++;
            
        }

    });

    $("#courses").prop('selectedIndex', 0);
    $("#player").val("");
    $("#level").prop('selectedIndex', 0);

    $("#level_row").addClass("d-none");
    $("#level").empty().append('<option value="">Select Level</option>');

});

function markingScore() {
    var key_press = event.key;

    if (/^[A-Za-z]*$/.test(key_press) == true) {
        event.preventDefault();
    } else {
        var current_score = event.currentTarget.id;
        console.log(event.currentTarget.id);
    }

}


$(document).ready(() => {
    $("#newPlayerModal").modal("show");
});