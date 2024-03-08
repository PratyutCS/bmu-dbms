window.addEventListener("load",function(){
    btn1(1);
    btn2(1);
  })


function btn1(i){
    if(i==1){
        document.querySelector(".sc1-2-btn1").classList.add("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn2").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn3").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn4").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn5").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn6").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-txt1").style.color = "#000000";
        document.querySelector(".sc1-2-txt2").style.color = "#797979";
        document.querySelector(".sc1-2-txt3").style.color = "#797979";
        document.querySelector(".sc1-2-txt4").style.color = "#797979";
        document.querySelector(".sc1-2-txt5").style.color = "#797979";
        document.querySelector(".sc1-2-txt6").style.color = "#797979";
        document.querySelector(".sc2-2-1-linkLine-0").innerHTML = "Grade Sheet";
    }
    else if(i==2){
        document.querySelector(".sc1-2-btn1").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn2").classList.add("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn3").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn4").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn5").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn6").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-txt1").style.color = "#797979";
        document.querySelector(".sc1-2-txt2").style.color = "#000000";
        document.querySelector(".sc1-2-txt3").style.color = "#797979";
        document.querySelector(".sc1-2-txt4").style.color = "#797979";
        document.querySelector(".sc1-2-txt5").style.color = "#797979";
        document.querySelector(".sc1-2-txt6").style.color = "#797979";
        document.querySelector(".sc2-2-1-linkLine-0").innerHTML = "Results & Exam Dates";
    }
    else if(i==3){
        document.querySelector(".sc1-2-btn1").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn2").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn3").classList.add("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn4").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn5").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn6").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-txt1").style.color = "#797979";
        document.querySelector(".sc1-2-txt2").style.color = "#797979";
        document.querySelector(".sc1-2-txt3").style.color = "#000000";
        document.querySelector(".sc1-2-txt4").style.color = "#797979";
        document.querySelector(".sc1-2-txt5").style.color = "#797979";
        document.querySelector(".sc1-2-txt6").style.color = "#797979";
        document.querySelector(".sc2-2-1-linkLine-0").innerHTML = "Student Grievance";
    }
    else if(i==4){
        document.querySelector(".sc1-2-btn1").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn2").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn3").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn4").classList.add("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn5").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn6").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-txt1").style.color = "#797979";
        document.querySelector(".sc1-2-txt2").style.color = "#797979";
        document.querySelector(".sc1-2-txt3").style.color = "#797979";
        document.querySelector(".sc1-2-txt4").style.color = "#000000";
        document.querySelector(".sc1-2-txt5").style.color = "#797979";
        document.querySelector(".sc1-2-txt6").style.color = "#797979";
        document.querySelector(".sc2-2-1-linkLine-0").innerHTML = "Pass Percentage";
    }
    else if(i==5){
        document.querySelector(".sc1-2-btn1").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn2").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn3").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn4").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn5").classList.add("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn6").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-txt1").style.color = "#797979";
        document.querySelector(".sc1-2-txt2").style.color = "#797979";
        document.querySelector(".sc1-2-txt3").style.color = "#797979";
        document.querySelector(".sc1-2-txt4").style.color = "#797979";
        document.querySelector(".sc1-2-txt5").style.color = "#000000";
        document.querySelector(".sc1-2-txt6").style.color = "#797979";
        document.querySelector(".sc2-2-1-linkLine-0").innerHTML = "Courses repeated";
    }
    else{
        document.querySelector(".sc1-2-btn1").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn2").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn3").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn4").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn5").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn6").classList.add("sc1-2-btn-active");
        document.querySelector(".sc1-2-txt1").style.color = "#797979";
        document.querySelector(".sc1-2-txt2").style.color = "#797979";
        document.querySelector(".sc1-2-txt3").style.color = "#797979";
        document.querySelector(".sc1-2-txt4").style.color = "#797979";
        document.querySelector(".sc1-2-txt5").style.color = "#797979";
        document.querySelector(".sc1-2-txt6").style.color = "#000000";
        document.querySelector(".sc2-2-1-linkLine-0").innerHTML = "Exam Annual Report";
        window.open("./research.html", "_self");
    }
}


function btn2(i){
    if(i==1){
        document.querySelector(".sc2-2-2-1-btn1").classList.add("sc2-2-2-1-btn-active");
        document.querySelector(".sc2-2-2-1-btn2").classList.remove("sc2-2-2-1-btn-active");
        document.querySelector(".sc2-2-2-1-btn3").classList.remove("sc2-2-2-1-btn-active");
        document.querySelector(".sc2-2-2-1-btn4").classList.remove("sc2-2-2-1-btn-active");
        document.querySelector(".sc2-2-1-linkLine-1").innerHTML = "School of Management";
    }
    else if(i==2){
        document.querySelector(".sc2-2-2-1-btn1").classList.remove("sc2-2-2-1-btn-active");
        document.querySelector(".sc2-2-2-1-btn2").classList.add("sc2-2-2-1-btn-active");
        document.querySelector(".sc2-2-2-1-btn3").classList.remove("sc2-2-2-1-btn-active");
        document.querySelector(".sc2-2-2-1-btn4").classList.remove("sc2-2-2-1-btn-active");
        document.querySelector(".sc2-2-1-linkLine-1").innerHTML = "School of Engeeniring Tech.";
    }
    else if(i==3){
        document.querySelector(".sc2-2-2-1-btn1").classList.remove("sc2-2-2-1-btn-active");
        document.querySelector(".sc2-2-2-1-btn2").classList.remove("sc2-2-2-1-btn-active");
        document.querySelector(".sc2-2-2-1-btn3").classList.add("sc2-2-2-1-btn-active");
        document.querySelector(".sc2-2-2-1-btn4").classList.remove("sc2-2-2-1-btn-active");
        document.querySelector(".sc2-2-1-linkLine-1").innerHTML = "School of Law";
    }
    else{
        document.querySelector(".sc2-2-2-1-btn1").classList.remove("sc2-2-2-1-btn-active");
        document.querySelector(".sc2-2-2-1-btn2").classList.remove("sc2-2-2-1-btn-active");
        document.querySelector(".sc2-2-2-1-btn3").classList.remove("sc2-2-2-1-btn-active");
        document.querySelector(".sc2-2-2-1-btn4").classList.add("sc2-2-2-1-btn-active");
        document.querySelector(".sc2-2-1-linkLine-1").innerHTML = "School of Liberal Studies";
    }
}