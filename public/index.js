function sendData() {
    var selectedVote = document.querySelector('input[name="vote"]:checked').value;
    fetch('/vote', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ vote: selectedVote }),
        credentials: 'include',
        redirect: 'follow'
    }).then(response => {
        if (response.redirected) {
            window.location.href = response.url;
        } else {
            return response.text();
        }
    }).then(result => {
        if (result) {
            alert(result);
        }
    }).catch(error => {
        console.error('Error:', error);
    });
}