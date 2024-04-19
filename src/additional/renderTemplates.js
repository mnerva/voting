exports.renderIdentificationPage = (errorMessage) => {
    return `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Indetification</title>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <script src="index.js"></script>
</head>

<body>
    <div>
        <div><i class="material-icons">account_circle</i><span id="voter_name">Külaline</span></div>
        <div><i class="material-icons">access_time</i><span id="timer">--:--</span></div>
    </div>
    <hr>
    <div>
        <p>Tuvasta oma isik: </p>
        <form action="/identification" method="post">
            <label for="firstname">Eesnimi:</label>
            <input type="text" id="firstname" name="firstname"><br>
            <label for="lastname">Perenimi:</label>
           <input type="text" id="lastname" name="lastname"><br>
            <p class="error-message">${errorMessage}</p>
            <input type="submit" value="Submit">
        </form>
    </div>
</body>

</html> `
};

exports.renderVotingPage = (errorMessage) => {
    return `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hääletus</title>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
    <script src="index.js"></script>
</head>

<body>
    <div>
        <div><i class="material-icons">account_circle</i><span id="voter_name">Külaline</span></div>
        <div><i class="material-icons">access_time</i><span id="timer"></span></div>
    </div>
    <hr>
    <div>
        <p>Langeta oma otsus</p>
        <form id="voteForm">
            <input type="radio" id="poolt" name="vote" value="Poolt">
            <label for="poolt" class="vote-button">Poolt</label>
            <input type="radio" id="vastu" name="vote" value="Vastu">
            <label for="vastu" class="vote-button">Vastu</label>
            <p class="error-message">${errorMessage}</p>
            <button type="button" onclick="sendData()">Saada</button>
        </form>
    </div>
</body>

</html>`;
};
