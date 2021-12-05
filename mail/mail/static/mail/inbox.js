document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email(false, "", "", "", ""));
  document.querySelector('#compose-button').addEventListener("click", send_email);
  
  //document.querySelectorAll('.messageContainer').addEventListener("click", open_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

// compose e-mail. Inputs to the function allow to prefill from in case of reply.
function compose_email(reply, subject, sender, timestamp, body) {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#message-view').style.display = 'none';
  
  let subjectRe = '';
  if (subject.length >= 3) {
    subjectRe = subject.slice(0,3);
  } else {
    subjectRe = subject;
  }
  console.log(subjectRe);
  
  if (reply === false) {
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
  } else {
    document.querySelector('#compose-recipients').value = `${sender}`;
    document.querySelector('#compose-body').value = `On ${timestamp} ${sender} wrote: \n${body}`;
    if (subjectRe !== "Re:") {
      document.querySelector('#compose-subject').value = `Re: ${subject}`;
    } else {
      document.querySelector('#compose-subject').value = `${subject}`;
    }
  }
}

// Sending e-mail
function send_email() {

  // create variables for message
  let sendRecipient;
  let sendSubject;
  let sendBody;

  // select form
  const sendForm = document.querySelector("#compose-form");

  // Sending a form. Replaced submit button to button to be able to select route after submitting the form
  // sendForm.addEventListener('submit', () => {
  //document.querySelector('#compose-button').addEventListener("click", () => {  - remove it out of the function otherwise there are duplications..
  // Get values from the form fields
  sendRecipient = document.querySelector("#compose-recipients").value;
  sendSubject = document.querySelector("#compose-subject").value;
  sendBody = document.querySelector("#compose-body").value;
  // create a fetch request
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: sendRecipient,
        subject: sendSubject,
        body: sendBody
    })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
    });
    setTimeout(() => { load_mailbox('sent'); }, 1500);    
}

// Loading a mailbox
function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#message-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    emails.forEach(element => {
      
      // Create a div to control event listener
      const messageContainer = document.createElement('div');
      messageContainer.className = 'mail-container';

      // Create a div to contain all message data
      const message = document.createElement('div');
      
      // Create a value for a sender
      const messageSender = document.createElement('span');
      messageSender.innerHTML = `${element.sender}`;
      messageSender.className = 'sender';

      // Create a value for a subject
      const messageSubject = document.createElement('span');
      messageSubject.innerHTML = `${element.subject}`;
      
      if (element.read === false ) {
        message.className = 'mail-unread';
        messageSender.className = 'sender';
        messageSubject.className = 'subject';
      } else {
        message.className = 'mail-read';
        messageSender.className = 'sender';
        messageSubject.className = 'subject';
      }
      
      // Append message container to 
      messageContainer.appendChild(message);
      // Append sender to a message
      message.appendChild(messageSender);
      // Append subj to a message
      message.appendChild(messageSubject);

      // Create a value for a date
      const messageDate = document.createElement('span');
      messageDate.innerHTML = `${element.timestamp}`;
      messageDate.className = 'date';
      // Append date to a message
      message.appendChild(messageDate);
   
      document.querySelector('#emails-view').append(messageContainer);

      // add click event listener
      messageContainer.addEventListener("click", function (){
        open_email(element.id, mailbox);
      });
      //console.log(`email number ${element.id}`);
      //console.log(`from ${element.sender} subject ${element.subject} date ${element.timestamp}`);
    });

  });
}

// Open e-mail
function open_email(id, mailbox) {

  // Hide previous pages
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  // Show e-mail view
  let message = document.querySelector('#message-view');
  message.style.display = 'block';
  
  // Clear previous e-mail
  message.innerHTML = '';
  
  // Mark e-mail as read
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  });

  // Test that e-mail was clicked
  console.log(`you clicked email ${id}`);

  // Variable with titles
  var titles = ["from", "to", "subject", "timestamp"];

  titles.forEach(element => {
    console.log(element);
  });

  // Fetch request to the server
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);
    
    titles.forEach(element => {
      const line = document.createElement('div');
      line.id = element;

      const title = document.createElement('span');
      title.className = 'title';
      title.innerHTML = `${element.charAt(0).toUpperCase() + element.slice(1)}: `;

      message.appendChild(line);
      line.appendChild(title);
    });

    //add data to From field
    const messageFrom = document.createElement('span');
    messageFrom.innerHTML = email.sender;
    document.querySelector('#from').appendChild(messageFrom);
    
    //add data to To field
    const messageTo = document.createElement('span');
    messageTo.innerHTML = email.recipients;
    document.querySelector('#to').appendChild(messageTo);

    //add data to Subject field
    const messageSubject = document.createElement('span');
    messageSubject.innerHTML = email.subject;
    document.querySelector('#subject').appendChild(messageSubject);

    //add data to Timestamp field
    const messageTimestamp = document.createElement('span');    
    messageTimestamp.innerHTML = email.timestamp;
    document.querySelector('#timestamp').appendChild(messageTimestamp);

    // Add a button Reply
    const buttonReply = document.createElement('button');
    buttonReply.innerHTML = "Reply";
    buttonReply.className = "btn btn-sm btn-outline-primary buttons";
    buttonReply.id = 'reply';
    message.appendChild(buttonReply);
    document.querySelector('#reply').addEventListener("click", function() {
      console.log(`reply to email of ${email.sender}, subject ${email.subject}`);
      compose_email(true, email.subject, email.sender, email.timestamp, email.body); 
    });

    // Add a button Archive for inbox an unarchive for Archive mailbox
    if (mailbox === "inbox") {
      const buttonArchive = document.createElement('button');
      buttonArchive.innerHTML = "Archive";
      buttonArchive.className = "btn btn-sm btn-outline-primary buttons";
      buttonArchive.id = 'archive';
      message.appendChild(buttonArchive);
      document.querySelector('#archive').addEventListener("click", function() {
        archive(id, email.archived);
        setTimeout(() => { load_mailbox('inbox'); }, 500);
      });
    } else if (mailbox === "archive") {
      const buttonArchive = document.createElement('button');
      buttonArchive.innerHTML = "Unarchive";
      buttonArchive.className = "btn btn-sm btn-outline-primary buttons";
      buttonArchive.id = 'archive';
      message.appendChild(buttonArchive);
      document.querySelector('#archive').addEventListener("click", function() {
        archive(id, email.archived);
        setTimeout(() => { load_mailbox('archive'); }, 500);
      });
    }

    // Add a break line
    message.appendChild(document.createElement('hr'));

    // Add a body of the message
    const messageBody = document.createElement('p');    
    messageBody.innerText = email.body;
    messageBody.className = 'body';
    message.appendChild(messageBody);
    
    // ... do something else with email ...
  });
}

// Archive/unarchive a message
function archive(id, archived) {
  if (archived === true) {
    console.log('set archived to false');
    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: false
      })
    })
  } else {
    console.log('set archived to true');
    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: true
      })
    })
  }  
}