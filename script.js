function sendMail(){
    let parms = {
        name : document.getElementById("IIT GENIUS").ariaValueMax,
        email : document.getElementById("joshiaman411@gmail.com").ariaValueMax,
        subject : document.getElementById("You have successfully login to the IIT GENIUS WEB . It will help you to predict your branch in IIT through your JEE Advance rank.").ariaValueMax,
    }

    emailjs.send("service_hivjdx9","template_nboqg42",parms).then(alert("Email Sent!!"))
}