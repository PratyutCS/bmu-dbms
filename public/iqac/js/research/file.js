window.addEventListener("load",function(){
    var val = document.querySelector(".val").innerHTML;
    btn1(val);
    document.querySelector(".loader").style.display = "none";
    document.querySelector(".lmfao").style.display = "flex";
    charts();
  })


function btn1(i){
    if(i==1){
        document.querySelector(".sc1-2-btn1").classList.add("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn2").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn3").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn4").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-txt1").style.color = "#000000";
        document.querySelector(".sc1-2-txt2").style.color = "#797979";
        document.querySelector(".sc1-2-txt3").style.color = "#797979";
        document.querySelector(".sc1-2-txt4").style.color = "#797979";
        document.querySelector(".sc2-2-1-linkLine-1").innerHTML = "School of Management";
    }
    else if(i==2){
        document.querySelector(".sc1-2-btn1").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn2").classList.add("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn3").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn4").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-txt1").style.color = "#797979";
        document.querySelector(".sc1-2-txt2").style.color = "#000000";
        document.querySelector(".sc1-2-txt3").style.color = "#797979";
        document.querySelector(".sc1-2-txt4").style.color = "#797979";
        document.querySelector(".sc2-2-1-linkLine-1").innerHTML = "School of Engeeniring Tech.";
    }
    else if(i==3){
        document.querySelector(".sc1-2-btn1").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn2").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn3").classList.add("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn4").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-txt1").style.color = "#797979";
        document.querySelector(".sc1-2-txt2").style.color = "#797979";
        document.querySelector(".sc1-2-txt3").style.color = "#000000";
        document.querySelector(".sc1-2-txt4").style.color = "#797979";
        document.querySelector(".sc2-2-1-linkLine-1").innerHTML = "School of Law";
    }
    else{
        document.querySelector(".sc1-2-btn1").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn2").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn3").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-btn4").classList.remove("sc1-2-btn-active");
        document.querySelector(".sc1-2-txt1").style.color = "#797979";
        document.querySelector(".sc1-2-txt2").style.color = "#797979";
        document.querySelector(".sc1-2-txt3").style.color = "#797979";
        document.querySelector(".sc1-2-txt4").style.color = "#797979";
        document.querySelector(".sc2-2-1-linkLine-1").innerHTML = "School of Liberal Studies";
    }
    document.querySelector(".loader").style.display = "flex";
    document.querySelector(".lmfao").style.display = "none";
}
function charts(){
    let arr1 = document.querySelectorAll(".cd1");
    let arr2 = document.querySelectorAll(".cd2");
    let x = [];
    let y = [];
    arr1.forEach(elems =>{
        x.push(elems.innerHTML);
    });
    arr2.forEach(elems =>{
        y.push(elems.innerHTML);
    });
    console.log(x);
    console.log(y);

    let bgcl = Array.from({ length: y.length }, () => getRandomColor());

    new Chart("myChart", {
        type: "bar",
        data: {
          labels: x,
          datasets: [{
            backgroundColor: bgcl,
            data: y
          }]
        },
        options: {
          legend: {display: false}
        }
    });
    
    new Chart("myChart1", {
        type: "doughnut",
        data: {
          labels: x,
          datasets: [{
            backgroundColor: bgcl,
            data: y
          }]
        },
        options: {
          legend: {display: false}
        }
    });
    
    new Chart("myChart2", {
        type: "pie",
        data: {
          labels: x,
          datasets: [{
            backgroundColor: bgcl,
            data: y
          }]
        },
        options: {
          legend: {display: false}
        }
    });
}


function getRandomColor() {
    // Function to generate a random hex color code
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }