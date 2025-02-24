import { useEffect, useState, useRef } from "react";
import axios from "axios";
import NotificationBar from "./NotificationBar";
import LoadingScreen from "./LoadingScreen";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import cardsDeck from "./assets/cardsDeck.jpg";
import coins from "./assets/coins.jpg";
import Duke from "./assets/Duke.jpeg";
import Assassin from "./assets/Assassin.jpeg";
import Ambassador from "./assets/Ambassador.jpeg";
import Captain from "./assets/Captain.jpeg";
import Contessa from "./assets/Contessa.jpeg";

function App() {
  const [name, setName] = useState("");
  const [gameStrength, setGameStrength] = useState(2);
  const [roomId, setRoomId] = useState("");
  const [inRoom, setInRoom] = useState(false);
  const [creator, setCreator] = useState(false);
  const [members, setMembers] = useState([]);
  const [inGame, setInGame] = useState(false);
  const isMobile = window.innerWidth < 1024;

  const nameRegex = /^(?!.*\d)[\p{L}\p{M}\p{S}\p{P}]{3,10}$/u;
  // const ws = new WebSocket("wss://coup-backend.onrender.com");
  const wsRef = useRef(null);
  const reconnectInterval = useRef(null);

  const [notification, setNotification] = useState({
    message: "",
    type: "",
    show: false,
  });
  const [loading, setLoading] = useState(false);

  const videoRefs = useRef({});
  const [streams, setStreams] = useState({});
  const [userSettings, setUserSettings] = useState({});

  const characters = ["Duke", "Assassin", "Ambassador", "Captain", "Contessa"];

  const [deck, setDeck] = useState([]);
  const [totalCoins, setTotalCoins] = useState(0);
  const [playersWithTheirCards, setPlayersWithTheirCards] = useState({});
  const [playersWithCoins, setPlayersWithCoins] = useState({});
  const [playersInGame, setPlayersInGame] = useState([]);

  const [yourTurn, setYourTurn] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [targetedMember, setTargetedMember] = useState("");
  const [showPlayerSelection, setShowPlayerSelection] = useState(false);
  const [enableBlockButton, setEnableBlockButton] = useState(false);
  const [enableChallengeButton, setEnableChallengeButton] = useState(false);
  const [turn, setTurn] = useState("");
  const [showSelectLossCharacterBox, setShowSelectLossCharacterBox] =
    useState(false);
  const [showAmbassadorScreen, setShowAmbassadorScreen] = useState(false);
  const [selectedDeckCard, setSelectedDeckCard] = useState(null);
  const [selectedPlayerCard, setSelectedPlayerCard] = useState(null);
  const [selectedDeckCardIndex, setSelectedDeckCardIndex] = useState(null);
  const [selectedPlayerCardIndex, setSelectedPlayerCardIndex] = useState(null);
  const [isActionIsBlockedOrChallenged, setIsActionIsBlockedOrChallenged] =
    useState(false);
  const [blockedBy, setBlockedBy] = useState("");
  const [showBlockAcceptOrRejectBox, setShowBlockAcceptOrRejectBox] =
    useState(false);
  const [waitingToLoseCharacter , setWaitingToLoseCharacter] = useState(false)
  const [waitingToLoseCharacterViaChallenge , setWaitingToLoseCharacterViaChallenge] = useState(false)
  const [rulesScreen , setRulesScreen] = useState(false);

  let actionOptions = [
    "Take One coin from bank",
    "Take Two coins from bank",
    "Coup a player with 7 coins",
    "Coup a player with 14 coins",
    "Take Three coins from bank",
    "Steal 2 coins from other player",
    "Assassin a player with 3 coins",
    "Exchange your card with deck",
  ];

  const rules = [
    {name:"Income" , action: "Take One coin from bank" , counterAction : "-"},
    {name:"Foreign Aid" , action: "Take Two coins from bank" , counterAction : "-"},
    {name:"Coup" , action: "Coup a player with 7 coins" , counterAction : "-"},
    {name:"Super Coup" , action: "Coup a player with 14 coins" , counterAction : "-"},
    {name:"Duke" , action: "Take Three coins from bank" , counterAction : "Blocks Foreign Aid"},
    {name:"Captain" , action: "Steal 2 coins from other player" , counterAction : "Blocks Stealing"},
    {name:"Assassin" , action: "Assassin a player with 3 coins" , counterAction : "-"},
    {name:"Ambassador" , action: "Exchange your card with deck" , counterAction : "Blocks Stealing"},
    {name:"Contessa" , action: "-" , counterAction : "Blocks Assassining and Coup but not Super Coup"}
  ]

  const gamerules = [
    "Action button will be enabled only if it is your turn",
    "Challenge and block button will be enabled only if the action taken have Challenged or blocked option",
    "The action can be chllenged or blocked within 12 seconds only",
    "If a action is taken aggainst a particular player he will have the option to challenge or block first for first 6 seconds then the button to challenge or block will be enabled to all including targetted person also"
  ]

  const showNotification = (msg, type) => {
    setNotification({ message: msg, type, show: true });
    setTimeout(() => setNotification({ ...notification, show: false }), 5000);
  };

// Refs for state values
const nameRef = useRef(name);
const roomIdRef = useRef(roomId);
const creatorRef = useRef(creator);
const membersRef = useRef(members);
const selectedOptionRef = useRef(selectedOption);
const turnRef = useRef(turn);
const blockedByRef = useRef(blockedBy);
const playersInGameRef = useRef(playersInGame);
const playersWithTheirCardsRef = useRef(playersWithTheirCards);
const playersWithCoinsRef = useRef(playersWithCoins);
const deckRef = useRef(deck);
const totalCoinsRef = useRef(totalCoins);
const isActionIsBlockedOrChallengedRef = useRef(isActionIsBlockedOrChallenged)
const targetedMemberRef = useRef(targetedMember);
const waitingToLoseCharacterRef = useRef(waitingToLoseCharacter);
const waitingToLoseCharacterViaChallengeRef = useRef(waitingToLoseCharacterViaChallenge)
const actionTimeoutRef = useRef(null);

// Update refs when state changes
useEffect(() => {
  nameRef.current = name;
}, [name]);

useEffect(() => {
  roomIdRef.current = roomId;
}, [roomId]);

useEffect(() => {
  creatorRef.current = creator;
}, [creator]);

useEffect(() => {
  membersRef.current = members;
}, [members]);

useEffect(() => {
  selectedOptionRef.current = selectedOption;
}, [selectedOption]);

useEffect(() => {
  turnRef.current = turn;
}, [turn]);

useEffect(() => {
  blockedByRef.current = blockedBy;
}, [blockedBy]);

useEffect(() => {
  playersInGameRef.current = playersInGame;
}, [playersInGame]);

useEffect(() => {
  playersWithTheirCardsRef.current = playersWithTheirCards;
}, [playersWithTheirCards]);

useEffect(() => {
  playersWithCoinsRef.current = playersWithCoins;
}, [playersWithCoins]);

useEffect(() => {
  deckRef.current = deck;
}, [deck]);

useEffect(() => {
  totalCoinsRef.current = totalCoins;
}, [totalCoins]);

useEffect(() => {
  isActionIsBlockedOrChallengedRef.current = isActionIsBlockedOrChallenged;
}, [isActionIsBlockedOrChallenged]);

useEffect(() => {
  targetedMemberRef.current = targetedMember;
}, [targetedMember]);

useEffect(() => {
  waitingToLoseCharacterRef.current = waitingToLoseCharacter;
}, [waitingToLoseCharacter]);

useEffect(() => {
  waitingToLoseCharacterViaChallengeRef.current = waitingToLoseCharacterViaChallenge;
}, [waitingToLoseCharacterViaChallenge]);

const connectWebSocket = () => {
  if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return; // Avoid duplicate connections

  wsRef.current = new WebSocket("wss://coup-backend.onrender.com"); // Replace with your actual WebSocket URL

  wsRef.current.onopen = () => {
    console.log("WebSocket connected");
    if (reconnectInterval.current) {
      clearInterval(reconnectInterval.current); // Stop reconnection attempts
      reconnectInterval.current = null;
    }
  };

  wsRef.current.onclose = () => {
    console.log("WebSocket disconnected. Attempting to reconnect...");
    attemptReconnect();
  };

  wsRef.current.onerror = (error) => {
    console.error("WebSocket error:", error);
    wsRef.current.close(); // Ensure proper cleanup on error
  };

  wsRef.current.onmessage = (event) => {
    const resp = JSON.parse(event.data);
    if (resp.roomId === roomIdRef.current) {
      handleWebSocketMessage(resp);
    }
  };
};

const attemptReconnect = () => {
  if (!reconnectInterval.current) {
    reconnectInterval.current = setInterval(() => {
      console.log("Reconnecting WebSocket...");
      connectWebSocket();
    }, 3000); // Retry every 3 seconds
  }
};

useEffect(() => {
  connectWebSocket();

  return () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (reconnectInterval.current) {
      clearInterval(reconnectInterval.current);
    }
  };
}, []);

const sendMessage = (message) => {
  if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
    wsRef.current.send(JSON.stringify(message));
  } else {
    showNotification("sorry please try again websocket is disconnected and trying to connect","error")
    console.warn("WebSocket not connected. Reconnecting...");
    attemptReconnect(); 
  }
};

  const handleWebSocketMessage  = (resp) => {
    console.log(resp)
    if (resp.type === "join") {
      showNotification(resp.notifyMessage, "info");
      // console.log(resp.notifyMessage)
      fetchParticipants(roomIdRef.current);
    }
    if (resp.type === "kicked" && resp.sender === nameRef.current) {
      showNotification(resp.notifyMessage, "info");
      // console.log(resp.notifyMessage)
      commonOpperationsForKickedLeaveDelete();
    }
    if (
      (resp.type === "kick" || resp.type === "leave") &&
      resp.sender !== nameRef.current
    ) {
      showNotification(resp.notifyMessage, "info");
      // console.log(resp.notifyMessage)
      fetchParticipants(roomIdRef.current);
    }
    if (resp.type === "delete") {
      showNotification(resp.notifyMessage, "info");
      // console.log(resp.notifyMessage)
      commonOpperationsForKickedLeaveDelete();
    }
    if (resp.type === "newStreamUploaded") {
       getUpatedAudioAndVedioOfParticipants();
      if (resp.notifyMessage) {
        showNotification(resp.notifyMessage, "info");
      }
    }
    if (resp.type === "startGame") {
      setPlayersInGame([...membersRef.current]);
      if (creatorRef.current) {
        initializeDeck();
      }
    }
    if (resp.type === "gameStarted") {
      setDeck(resp.deck);
      setTotalCoins(resp.totalCoins);
      setPlayersWithTheirCards(resp.playersWithTheirCards);
      setPlayersWithCoins(resp.playersWithCoins);
      setRulesScreen(false)
      setInGame(true);

      if(nameRef.current === resp.from){
      let message = {
        roomId: roomIdRef.current,
        type: "turn",
        person: membersRef.current[0],
      };
      sendMessage(message)
    }
    }
    if (resp.type === "updated") {
      if (resp.deck !== undefined) {
        setDeck(resp.deck);
      }
      if (resp.totalCoins !== undefined) {
        setTotalCoins(resp.totalCoins);
      }
      if (resp.playersWithTheirCards !== undefined) {
        setPlayersWithTheirCards(resp.playersWithTheirCards);
      }
      if (resp.playersWithCoins !== undefined) {
        setPlayersWithCoins(resp.playersWithCoins);
      }
      if (resp.playersInGame !== undefined) {
        setPlayersInGame(resp.playersInGame);
      }
      if(waitingToLoseCharacterRef.current === true){
        let message = {
          roomId : roomIdRef.current,
          type : "I lost a character",
          from : nameRef.current,
          to : turnRef.current
        }
        sendMessage(message)
        setWaitingToLoseCharacter(false)
      }
      if (waitingToLoseCharacterViaChallengeRef.current === true) {
        let message = {
          roomId: roomIdRef.current,
          type: "you won",
          from: nameRef.current,
          to: turnRef.current,
        };
  
        sendMessage(message)
        setWaitingToLoseCharacterViaChallenge(false)
      }
    }
    if (resp.type === "turn") {
      showNotification(`${resp.person}'s turn`, "info");
      if (resp.person === nameRef.current) {
        setYourTurn(true);
      }
      setTurn(resp.person);
      // setSelectedOption("");
      setTargetedMember("");
      setBlockedBy("");
      setIsActionIsBlockedOrChallenged(false)
      setStartTimer(false)
      setTime(0)
      if (actionTimeoutRef.current) {
        clearTimeout(actionTimeoutRef.current);
        actionTimeoutRef.current = null;
      }
    }
    if (resp.type === "action") {
      showNotification(resp.notifyMessage, "info");
      setSelectedOption(resp.actionPlayed);
      setStartTimer(true)
      setTime(12)

      if(resp.actionPlayed === "Assassin a player with 3 coins" && resp.person === nameRef.current){
        let newTotalCoins = totalCoinsRef.current;
        let newPlayersWithCoins = playersWithCoinsRef.current;
        let newPlayersWithCards = playersWithTheirCards.current;

        newPlayersWithCoins[nameRef.current] = newPlayersWithCoins[nameRef.current] - 3;
        newTotalCoins = newTotalCoins + 3;

        let message1 = {
          roomId: roomIdRef.current,
          type: "updated",
          totalCoins: newTotalCoins,
          playersWithTheirCards: newPlayersWithCards,
          playersWithCoins: newPlayersWithCoins,
        };
        sendMessage(message1)
      }
      if(resp.actionPlayed === "Coup a player with 7 coins" && resp.person === nameRef.current){
        let newTotalCoins = totalCoinsRef.current;
        let newPlayersWithCoins = playersWithCoinsRef.current;
        let newPlayersWithCards = playersWithTheirCards.current;

        newPlayersWithCoins[nameRef.current] = newPlayersWithCoins[nameRef.current] - 7;
        newTotalCoins = newTotalCoins + 7;

        let message1 = {
          roomId: roomIdRef.current,
          type: "updated",
          totalCoins: newTotalCoins,
          playersWithTheirCards: newPlayersWithCards,
          playersWithCoins: newPlayersWithCoins,
        };
        sendMessage(message1)
      }

      if (
        resp.actionPlayed === "Take One coin from bank" ||
        resp.actionPlayed === "Coup a player with 14 coins"
      ) {
        if (resp.person === nameRef.current) {
          performAction(false);
          setTime(0)
          setStartTimer(false)
        }
      } else {
        if (resp.target !== undefined) {
          if (resp.target === nameRef.current) {
            if (
              resp.person !== nameRef.current &&
              (resp.actionPlayed === "Take Two coins from bank" ||
                resp.actionPlayed === "Coup a player with 7 coins" ||
                resp.actionPlayed === "Steal 2 coins from other player" ||
                resp.actionPlayed === "Assassin a player with 3 coins")
            ) {
              setEnableBlockButton(true);
            }
            if (
              resp.person !== nameRef.current &&
              (resp.actionPlayed === "Take Three coins from bank" ||
                resp.actionPlayed === "Steal 2 coins from other player" ||
                resp.actionPlayed === "Assassin a player with 3 coins" ||
                resp.actionPlayed === "Exchange your card with deck")
            ) {
              setEnableChallengeButton(true);
            }
          }
          actionTimeoutRef.current = setTimeout(() => {
            if (!isActionIsBlockedOrChallengedRef.current) {
              if (
                resp.person !== nameRef.current &&
                (resp.actionPlayed === "Take Two coins from bank" ||
                  resp.actionPlayed === "Coup a player with 7 coins" ||
                  resp.actionPlayed === "Steal 2 coins from other player" ||
                  resp.actionPlayed === "Assassin a player with 3 coins")
              ) {
                setEnableBlockButton(true);
              }
              if (
                resp.person !== nameRef.current &&
                (resp.actionPlayed === "Take Three coins from bank" ||
                  resp.actionPlayed === "Steal 2 coins from other player" ||
                  resp.actionPlayed === "Assassin a player with 3 coins" ||
                  resp.actionPlayed === "Exchange your card with deck")
              ) {
                setEnableChallengeButton(true);
              }
            }
          }, 6000);
        } else {
          if (
            resp.person !== nameRef.current &&
            (resp.actionPlayed === "Take Two coins from bank" ||
              resp.actionPlayed === "Coup a player with 7 coins" ||
              resp.actionPlayed === "Steal 2 coins from other player" ||
              resp.actionPlayed === "Assassin a player with 3 coins")
          ) {
            setEnableBlockButton(true);
          }
          if (
            resp.person !== nameRef.current &&
            (resp.actionPlayed === "Take Three coins from bank" ||
              resp.actionPlayed === "Steal 2 coins from other player" ||
              resp.actionPlayed === "Assassin a player with 3 coins" ||
              resp.actionPlayed === "Exchange your card with deck")
          ) {
            setEnableChallengeButton(true);
          }
        }
        actionTimeoutRef.current = setTimeout(() => {
          if (!isActionIsBlockedOrChallengedRef.current) {
            let message = {
              roomId : roomIdRef.current,
              type : "noChallengeOrBlock"
            }
            if (resp.person === nameRef.current) {
              performAction(false);
              sendMessage(message)
            }
            setStartTimer(false)
            setTime(0)
          }
        }, 12000);
      }
    }
    if (resp.type === "challenge") {
      showNotification(resp.notifyMessage, "info");
      setIsActionIsBlockedOrChallenged(true);
      setStartTimer(false)
      setTime(0)
      if (actionTimeoutRef.current) {
        clearTimeout(actionTimeoutRef.current);
        actionTimeoutRef.current = null;
      }
      setEnableChallengeButton(false);
      setEnableBlockButton(false);
    }
    if (resp.type === "block") {
      showNotification(resp.notifyMessage, "info");
      setIsActionIsBlockedOrChallenged(true);
      setStartTimer(false)
      setTime(0)
      if (actionTimeoutRef.current) {
        clearTimeout(actionTimeoutRef.current);
        actionTimeoutRef.current = null;
      }
      setEnableBlockButton(false);
      setEnableChallengeButton(false);
      setBlockedBy(resp.from);
      if (resp.to === nameRef.current) {
        setShowBlockAcceptOrRejectBox(true);
      }
    }
    if (resp.type === "challenge response") {
      showNotification(resp.notifyMessage, "info");
    }
    if (resp.type === "block challenge response") {
      showNotification(resp.notifyMessage, "info");
    }
    if(resp.type === "noChallengeOrBlock"){
      setEnableBlockButton(false)
      setEnableChallengeButton(false)
    }
    if (resp.type === "you won" && resp.to === nameRef.current) {
      performAction(true);
    }
    if (resp.type === "you lost" && resp.to === nameRef.current) {
      performLoseCardLogic();
    }
    if (
      (resp.type === "assassin" ||
        resp.type === "coup with 14 coins" ||
        resp.type === "coup with 7 coins") &&
      resp.to === nameRef.current
    ) {
      setWaitingToLoseCharacter(true)
      performLoseCardLogic();
    }
    if(resp.type === "I lost a character" && resp.to === nameRef.current){
      nextTurnFunction()
    }
    if (resp.type === "accept block") {
      showNotification(resp.notifyMessage, "info");
      if (resp.from === nameRef.current) {
        let person;
        let playerIndex = playersInGameRef.current.indexOf(nameRef.current);
        if (
          playersInGameRef.current[playerIndex + 1] !== undefined &&
          playersInGameRef.current[playerIndex + 1] !== null
        ) {
          person = playersInGameRef.current[playerIndex + 1];
        } else {
          person = playersInGameRef.current[0];
        }
        let message = {
          roomId: roomIdRef.current,
          type: "turn",
          person: person,
        };
        sendMessage(message)
      }
    }
    if (resp.type === "challenge block") {
      showNotification(resp.notifyMessage, "info");
      if (resp.to === nameRef.current) {
        checkForCounterActionYouDid();
      }
    }
    if(resp.type === "gameOver"){
      showNotification(`Game Over Won by ${resp.winner}`,"info")
      setYourTurn(false)
      setTurn("")
      setSelectedOption("")
      setBlockedBy("")
      setTargetedMember("")
      setIsActionIsBlockedOrChallenged(false)
      setRulesScreen(false)
      setStartTimer(false)
      setTime(0)
      if (actionTimeoutRef.current) {
        clearTimeout(actionTimeoutRef.current);
        actionTimeoutRef.current = null;
      }
      setTimeout(()=>{
        setInGame(false)
      },5000)
    }
  }

  const fetchParticipants = async (id) => {
    await axios
      .get(`https://coup-backend.onrender.com/get-participants/${id}`)
      .then((response) => {
        const participants = response.data.participants;
        setMembers(participants);
        setGameStrength(response.data.gameStrength);
        setLoading(false);
      })
      .catch((error) => {
        showNotification("Invalid RoomId", "error");
        // console.error(error);
        setLoading(false);
      });
  };

  const createRoomServer = async () => {
    if (!nameRegex.test(name)) {
      showNotification(
        "name cannot be empty and it cannot have numericals and it should be between 3 to 10 characters",
        "error"
      );
      // console.log("name cannot be empty and it cannot have numericals and it should be between 3 to 25 characters")
    } else {
      try {
        setLoading(true);
        const response = await axios.post("https://coup-backend.onrender.com/create-room", {
          gameStrength,
        });
        if (response.data.roomId) {
          let roomId = response.data.roomId;
          setRoomId(roomId);
          try {
            const resp = await axios.post("https://coup-backend.onrender.com/join-room", {
              roomId,
              name,
              isMobile,
            });
            if (resp.status === 200) {
              try {
                fetchParticipants(roomId);
                showNotification(
                  "Room is created and you joined the room",
                  "info"
                );
                // console.log("Room is created and you have joined the room")
                setCreator(true);
                setInRoom(true);
              } catch (error) {
                showNotification("failed to join the room", "error");
                // console.error(error)
                setLoading(false);
              }
            }
          } catch (error) {
            showNotification("room creation failed", "error");
            // console.error(error)
            setLoading(false);
          }
        }
      } catch (error) {
        showNotification("room creation failed", "error");
        // console.error(error)
        setLoading(false);
      }
    }
  };

  const joinRoomServer = async () => {
    if (!nameRegex.test(name)) {
      showNotification(
        "name cannot be empty and it cannot have numericals and it should be between 3 to 10 characters",
        "error"
      );
      // console.log("name cannot be empty and it cannot have numericals and it should be between 3 to 25 characters")
    } else if (roomId === "") {
      showNotification("roomId cannot be empty", "error");
      // console.log("roomId cannot be empty")
    } else {
      setLoading(true);
      try {
        await axios
          .get(`https://coup-backend.onrender.com/get-participants/${roomId}`)
          .then(async (response) => {
            if (response.data) {
              let members = response.data.participants;
              let gameStrength = response.data.gameStrength;
              if (members.includes(name)) {
                showNotification("name has been already taken", "info");
                setLoading(false);
                // console.log("name has been already taken")
              } else if (members.length >= gameStrength) {
                showNotification("sorry room is already full", "info");
                setLoading(false);
                // console.log("sorry room is already full")
              } else {
                try {
                  const response = await axios.post(
                    "https://coup-backend.onrender.com/join-room",
                    { roomId, name }
                  );
                  if (response.status === 200) {
                    try {
                      fetchParticipants(roomId);
                      setInRoom(true);
                    } catch (error) {
                      showNotification("failed to join the room", "error");
                      // console.error(error)
                      setLoading(false);
                    }
                  }
                } catch (error) {
                  showNotification("failed to join the room", "error");
                  // console.error(error)
                  setLoading(false);
                }
              }
            } else {
              showNotification("Invalid RoomId", "error");
              // console.error(error);
              setLoading(false);
            }
          })
          .catch((error) => {
            showNotification("Invalid RoomId", "error");
            // console.error(error);
            setLoading(false);
          });
      } catch (error) {
        showNotification("Invalid RoomId", "error");
        // console.error(error);
        setLoading(false);
      }
    }
  };

  const kickPlayer = async (playerToBeKicked) => {
    try {
      let name = playerToBeKicked;
      let type = "kick";
      setLoading(true);
      const response = await axios.post("https://coup-backend.onrender.com/leave-room", {
        roomId,
        name,
        type,
      });
      if (response.status === 200) {
        showNotification(`kicked out ${playerToBeKicked} successfully`, "info");
        // console.log(`kicked out ${playerToBeKicked} successfully`)
        setLoading(false);
      }
    } catch (error) {
      showNotification("failed to kickout", "error");
      // console.error(error)
      setLoading(false);
    }
  };

  const leaveRoomServer = async () => {
    try {
      let type = "leave";
      setLoading(true);
      const response = await axios.post("https://coup-backend.onrender.com/leave-room", {
        roomId,
        name,
        type,
      });
      if (response.status === 200) {
        showNotification("you have left the room successfully", "info");
        // console.log("you have left the room successfully")
        commonOpperationsForKickedLeaveDelete();
        setLoading(false);
      }
    } catch (error) {
      showNotification("failed to leave the room", "error");
      // console.error(error)
      setLoading(false);
    }
  };

  const deleteRoom = async () => {
    try {
      setLoading(true);
      const response = await axios.delete(
        `https://coup-backend.onrender.com/delete-room/${roomId}`
      );
      if (response.status === 200) {
        showNotification("room is deleted successfully", "info");
        // console.log("room is deleted successfully")
        setLoading(false);
      }
    } catch (error) {
      showNotification("failed to delete the room", "error");
      // console.error(error)
      setLoading(false);
    }
  };

  function commonOpperationsForKickedLeaveDelete() {
    if (inRoom) {
      setInRoom(false);
      setRulesScreen(false)
    }
    setRoomId("");
    setName("");
    setMembers([]);
    setGameStrength(2);
    setCreator(false);

    // Clear video elements
    Object.entries(videoRefs.current).forEach(([member, videoElement]) => {
      if (videoElement) {
        videoElement.srcObject = null;
      }
    });

    // Stop all tracks in streams
    Object.values(streams).forEach((stream) => {
      if (stream && stream.getTracks) {
        stream.getTracks().forEach((track) => track.stop());
      }
    });

    // Clear all states
    setStreams({});
    setUserSettings({});
    videoRefs.current = {}; // Reset videoRefs
    window.location.reload();
  }

  const startStream = async (member) => {
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({
        video: !isMobile,
        audio: true,
      });

      if (userStream) {
        await uploadStream(member, userStream);
      }
    } catch (err) {
      if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError"
      ) {
        console.warn(`User denied access to media devices for ${member}`);
        try {
          const resp = await axios.post(
            "https://coup-backend.onrender.com/access-denaid-member",
            {
              roomId,
              name,
            }
          );
          if (resp.status === 200) {
            showNotification(
              "you are joining without audio and vedio so you cannot hear and view other's audio and view . And there will be no stream for you .If you are ok continue , else leave the room and give access to audio and vedio and rejoin",
              "info"
            );
            //  console.log(resp.message)
            setLoading(false);
          }
        } catch (error) {
          showNotification("failed to start the stream", "error");
          // console.error(error)
          setLoading(false);
        }
        setLoading(false);
      } else {
        showNotification("failed to start the stream", "error");
        console.error(err);
        setLoading(false);
      }
    }
  };

  const toggleAudio = async (member) => {
    if (streams[member]) {
      const audioTrack = streams[member].getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !userSettings[member]?.isAudioOn;

        const newStream = new MediaStream();
        streams[member].getTracks().forEach((track) => {
          if (track.kind === "audio") {
            track.enabled = audioTrack.enabled;
          }
          if (track.kind === "vedio") {
            track.enabled = userSettings[member]?.isVideoOnn;
          }
          newStream.addTrack(track);
        });

        try {
          let type = "audio";
          setLoading(true);
          const resp = await axios.post(
            "https://coup-backend.onrender.com/updateParticipantsAudioVedio",
            {
              roomId,
              name,
              type,
            }
          );
          if (resp.status === 200) {
            // console.log(resp.message)
            setLoading(false);
          }
        } catch (error) {
          showNotification("failed to toogle audio", "error");
          // console.error(error)
          setLoading(false);
        }
        await uploadStream(member, newStream);
      }
    } else {
      showNotification(
        "sorry you can access your audio , since you blocked the audio permissions",
        "error"
      );
    }
  };

  const toggleVideo = async (member) => {
    if (streams[member]) {
      const videoTrack = streams[member].getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !userSettings[member]?.isVideoOn;

        const newStream = new MediaStream();
        streams[member].getTracks().forEach((track) => {
          if (track.kind === "audio") {
            track.enabled = userSettings[member]?.isAudioOn;
          }
          if (track.kind === "video") {
            track.enabled = videoTrack.enabled;
          }
          newStream.addTrack(track);
        });

        try {
          let type = "vedio";
          setLoading(true);
          const resp = await axios.post(
            "https://coup-backend.onrender.com/updateParticipantsAudioVedio",
            {
              roomId,
              name,
              type,
            }
          );
          if (resp.status === 200) {
            // console.log(resp.message)
            setLoading(false);
          }
        } catch (error) {
          showNotification("failed to toogle vedio", "error");
          // console.error(error)
          setLoading(false);
        }
        await uploadStream(member, newStream);
      }
    } else {
      showNotification(
        "sorry you can access your video , since you blocked the video permissions",
        "error"
      );
    }
  };

  async function getUpatedAudioAndVedioOfParticipants() {
    await axios
      .get(`https://coup-backend.onrender.com/get-participants/${roomIdRef.current}`)
      .then(async (response) => {
        (membersRef.current).forEach((member) => {
          setUserSettings((prev) => ({
            ...prev,
            [member]: {
              isAudioOn: response.data.membersWithAudioOn.includes(member),
              isVideoOn: response.data.membersWithVedioOn.includes(member),
            },
          }));
        });
        getFullStream(response.data.streams);
        setLoading(false);
      })
      .catch((error) => {
        showNotification("failed to get updated audio and vedio", "error");
        // console.error(error);
        setLoading(false);
      });
  }

  async function uploadStream(name, userStream) {
    const streamData = {
      id: userStream.id,
      active: userStream.active,
      audioTracks: userStream.getAudioTracks().map((track) => ({
        id: track.id,
        enabled: track.enabled,
        label: track.label,
      })),
      videoTracks: userStream.getVideoTracks().map((track) => ({
        id: track.id,
        enabled: track.enabled,
        label: track.label,
      })),
    };

    try {
      setLoading(true);
      const response = await axios.post("https://coup-backend.onrender.com/upload-stream", {
        roomId,
        userStream: { [name]: streamData },
      });
      if (response.status === 200) {
        // console.log("your stream uploaded successfully")
        setLoading(false);
      }
    } catch (error) {
      showNotification("failed to upload stream", "error");
      // console.error(error)
      setLoading(false);
    }
  }

  async function getFullStream(allStreams) {
    const convertedStreams = {};

    Object.entries(allStreams).forEach(([member, streamData]) => {
      const newStream = new MediaStream();

      // Add audio tracks
      streamData.audioTracks?.forEach((trackInfo) => {
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((mediaStream) => {
            const audioTrack = mediaStream
              .getAudioTracks()
              .find((t) => t.label === trackInfo.label);
            if (audioTrack) {
              audioTrack.enabled = trackInfo.enabled;
              newStream.addTrack(audioTrack);
            }
          });
      });

      // Add video tracks
      streamData.videoTracks?.forEach((trackInfo) => {
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then((mediaStream) => {
            const videoTrack = mediaStream
              .getVideoTracks()
              .find((t) => t.label === trackInfo.label);
            if (videoTrack) {
              videoTrack.enabled = trackInfo.enabled;
              newStream.addTrack(videoTrack);
            }
          });
      });

      convertedStreams[member] = newStream;
    });

    setStreams(convertedStreams);
    let message = {
      roomId : roomId,
      type : "streamUpdatedSuccesfully"
    }
    sendMessage(message)
  }

  useEffect(() => {
    if (inRoom) {
      if (!streams[name]) {
        startStream(name);
      }
    }
  }, [inRoom]);

  useEffect(() => {
    Object.entries(streams).forEach(([member, stream]) => {
      if (
        videoRefs.current[member] &&
        videoRefs.current[member].srcObject !== stream
      ) {
        videoRefs.current[member].srcObject = stream;
      }
    });
  }, [streams]);

  const startGame = () => {
    let message = {
      roomId: roomIdRef.current,
      type: "startGame",
    };
    sendMessage(message)
  };

  async function initializeDeck() {
    let newDeck = [];
    characters.forEach((char) => {
      for (let i = 0; i < 3; i++) {
        newDeck.push(char);
      }
    });

    let shuffledDeck = await shuffleDeck(newDeck);
    distributeCards(shuffledDeck);
  }

  async function shuffleDeck(newDeck) {
    for (let i = newDeck.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
  }

  function distributeCards(shuffledDeck) {
    let newPlayersWithCards = {};
    let newPlayersWithCoins = {};
    let totalCoins = membersRef.current.length * 15;

    for (let i = 0; i < membersRef.current.length; i++) {
      newPlayersWithCards[membersRef.current[i]] = shuffledDeck.splice(0, 2);
      newPlayersWithCoins[membersRef.current[i]] = 2;
      totalCoins -= 2;
    }

    if (creatorRef.current) {
      let message = {
        roomId: roomIdRef.current,
        type: "gameStarted",
        deck: shuffledDeck,
        totalCoins: totalCoins,
        playersWithTheirCards: newPlayersWithCards,
        playersWithCoins: newPlayersWithCoins,
        from : nameRef.current
      };
      sendMessage(message)
    }
  }

  const handleOptionClick = (option) => {
    setShowOptions(false);

    if (option === "Coup a player with 7 coins" && playersWithCoinsRef.current[nameRef.current] < 7) {
      showNotification("you don't have 7 coins with you", "error");
      return;
    }
    if (
      option === "Coup a player with 14 coins" &&
      playersWithCoinsRef.current[nameRef.current] < 14
    ) {
      showNotification("you don't have 14 coins with you", "error");
      return;
    }
    if (
      option === "Assassin a player with 3 coins" &&
      playersWithCoinsRef.current[nameRef.current] < 3
    ) {
      showNotification("you don't have 3 coins with you", "error");
      return;
    }

    if (
      option === "Coup a player with 7 coins" ||
      option === "Coup a player with 14 coins" ||
      option === "Steal 2 coins from other player" ||
      option === "Assassin a player with 3 coins"
    ) {
      setShowPlayerSelection(true);
    } else {
      let message = {
        roomId: roomIdRef.current,
        type: "action",
        person: nameRef.current,
        actionPlayed: option,
        notifyMessage: `${
          option === "Take One coin from bank"
            ? `${nameRef.current} taking One coin from bank`
            : option === "Take Two coins from bank"
            ? `${nameRef.current} taking Two coin from bank`
            : option === "Take Three coins from bank"
            ? `${nameRef.current} taking Three coin from bank`
            : option === "Exchange your card with deck"
            ? `${nameRef.current} is Exchanging his character with the deck`
            : ""
        }`,
      };
      sendMessage(message)
      setYourTurn(false);
    }
  };

  const confirmPlayerSelection = (target) => {
    setTargetedMember(target);
    let message = {
      roomId: roomIdRef.current,
      type: "action",
      person: nameRef.current,
      target: target,
      actionPlayed: selectedOptionRef.current,
      notifyMessage: `${nameRef.current} is ${
        selectedOptionRef.current === "Coup a player with 7 coins" ||
        selectedOptionRef.current === "Coup a player with 14 coins"
          ? "Couping"
          : selectedOptionRef.current === "Steal 2 coins from other player"
          ? "Stealing from"
          : selectedOptionRef.current === "Assassin a player with 3 coins"
          ? "Assassining"
          : ""
      } ${target} ${
        selectedOptionRef.current === "Coup a player with 7 coins"
          ? "with 7 coins"
          : selectedOptionRef.current === "Coup a player with 14 coins"
          ? "with 14 coins"
          : selectedOptionRef.current === "Assassin a player with 3 coins"
          ? "with 3 coins"
          : ""
      } `,
    };
    sendMessage(message)
    setShowPlayerSelection(false);
    setYourTurn(false);
  };

  const confirmLossCardSelection = async (card) => {
    let newDeck = deckRef.current;
    let newPlayersWithCards = playersWithTheirCardsRef.current;

    let index = newPlayersWithCards[nameRef.current].indexOf(card);
    if (index !== -1) {
      newPlayersWithCards[nameRef.current].splice(index, 1);
    }
    newDeck.push(card);
    let shuffledDeck = await shuffleDeck(newDeck);

    let message = {
      roomId: roomIdRef.current,
      type: "updated",
      deck: shuffledDeck,
      totalCoins: totalCoinsRef.current,
      playersWithTheirCards: newPlayersWithCards,
      playersWithCoins: playersWithCoinsRef.current,
    };
    sendMessage(message)

    if(turnRef.current === nameRef.current){
       nextTurnFunction()
    }
    setShowSelectLossCharacterBox(false);
  };

  const onClickChallenge = async () => {
    let initialMessage = {
      roomId : roomIdRef.current,
      type: "challenge",
      notifyMessage: `Challenged by ${nameRef.current}`,
    };
    sendMessage(initialMessage)

    let message = {
      roomId: roomIdRef.current,
      type: "challenge response",
    };

    if (selectedOptionRef.current === "Take Three coins from bank") {
      if (playersWithTheirCardsRef.current[turnRef.current].includes("Duke")) {
        message["notifyMessage"] = `Challenge lost by ${nameRef.current}`;
        message["winner"] = turnRef.current;
        message["losser"] = nameRef.current;
      } else {
        message["notifyMessage"] = `Challenge won by ${nameRef.current}`;
        message["winner"] = nameRef.current;
        message["losser"] = turnRef.current;
      }
    }
    if (selectedOptionRef.current === "Steal 2 coins from other player") {
      if (playersWithTheirCardsRef.current[turnRef.current].includes("Captain")) {
        message["notifyMessage"] = `Challenge lost by ${nameRef.current}`;
        message["winner"] = turnRef.current;
        message["losser"] = nameRef.current;
      } else {
        message["notifyMessage"] = `Challenge won by ${nameRef.current}`;
        message["winner"] = nameRef.current;
        message["losser"] = turnRef.current;
      }
    }
    if (selectedOptionRef.current === "Assassin a player with 3 coins") {
      if (playersWithTheirCardsRef.current[turnRef.current].includes("Assassin")) {
        message["notifyMessage"] = `Challenge lost by ${nameRef.current}`;
        message["winner"] = turnRef.current;
        message["losser"] = nameRef.current;
      } else {
        message["notifyMessage"] = `Challenge won by ${nameRef.current}`;
        message["winner"] = nameRef.current;
        message["losser"] = turnRef.current;
      }
    }
    if (selectedOptionRef.current === "Exchange your card with deck") {
      if (playersWithTheirCardsRef.current[turn].includes("Ambassador")) {
        message["notifyMessage"] = `Challenge lost by ${nameRef.current}`;
        message["winner"] = turnRef.current;
        message["losser"] = nameRef.current;
      } else {
        message["notifyMessage"] = `Challenge won by ${nameRef.current}`;
        message["winner"] = nameRef.current;
        message["losser"] = turnRef.current;
      }
    }
    sendMessage(message)

    if (message.winner !== nameRef.current) {
      setWaitingToLoseCharacterViaChallenge(true)
      performLoseCardLogic();
    }
    else {
      let message = {
        roomId: roomIdRef.current,
        type: "you lost",
        from: nameRef.current,
        to: turnRef.current,
      };

      sendMessage(message)
    }
  };

  const onClickBlock = () => {
    let message = {
      roomId: roomIdRef.current,
      type: "block",
      from: nameRef.current,
      to: turnRef.current,
      notifyMessage: `Blocked by ${nameRef.current}`,
    };
    sendMessage(message)
  };

  const performLoseCardLogic = async () => {
    if (playersWithTheirCardsRef.current[nameRef.current].length === 2) {
      setRulesScreen(false)
      setShowSelectLossCharacterBox(true);
    } else {
      let card = playersWithTheirCardsRef.current[nameRef.current].pop();
      let coinsRemaining = playersWithCoinsRef.current[nameRef.current];

      let newDeck = deckRef.current;
      let newPlayersWithCards = playersWithTheirCardsRef.current;
      let newPlayersWithCoins = playersWithCoinsRef.current;
      let newPlayersInGame = playersInGameRef.current;

      newDeck.push(card);
      let shuffledDeck = await shuffleDeck(newDeck);
      newPlayersWithCards[nameRef.current] = [];
      newPlayersWithCoins[nameRef.current] = 0;

      newPlayersInGame = newPlayersInGame.filter((player) => player !== nameRef.current);

      let message = {
        roomId: roomIdRef.current,
        type: "updated",
        deck: shuffledDeck,
        totalCoins: totalCoinsRef.current + coinsRemaining,
        playersWithTheirCards: newPlayersWithCards,
        playersWithCoins: newPlayersWithCoins,
        playersInGame: newPlayersInGame,
      }
      sendMessage(message)
      if(newPlayersInGame.length < 2){
        let message = {
          roomId : roomIdRef.current,
          type : "gameOver",
          winner : newPlayersInGame[0]
        }
        sendMessage(message)
      }
    }
      if(turnRef.current === nameRef.current){
        nextTurnFunction()
      }
  };

  const replaceWithNewCard = async () => {
    let newDeck = deckRef.current;
    let newPlayersWithCards = playersWithTheirCardsRef.current;
    let newPlayersWithCoins = playersWithCoinsRef.current

    let card = (selectedOptionRef.current === "Take Three coins from bank") ? "Duke" : (selectedOptionRef.current === "Steal 2 coins from other player") ? "Captain" : (selectedOptionRef.current === "Assassin a player with 3 coins") ? "Assassin" : newPlayersWithCards[nameRef.current][0]

    const index = newPlayersWithCards[nameRef.current].indexOf(card);
    if (index !== -1) {
      newPlayersWithCards[nameRef.current].splice(index, 1);
      newDeck.push(card);
    }

    let shuffledDeck = await shuffleDeck(newDeck);
    if (index !== -1) {
        newPlayersWithCards[nameRef.current].push(shuffledDeck.shift());
    }

    let message = {
      roomId: roomIdRef.current,
      type: "updated",
      deck: shuffledDeck,
      playersWithTheirCards: newPlayersWithCards,
      playersWithCoins: newPlayersWithCoins
    };

    sendMessage(message)
  };

  const performAction = async (shouldReplaceCard) => {
    let newTotalCoins = totalCoinsRef.current;
    let newPlayersWithCoins = playersWithCoinsRef.current;
    let newPlayersWithCards = playersWithTheirCards.current;

    if (selectedOptionRef.current === "Take One coin from bank") {
      newTotalCoins = newTotalCoins - 1;
      newPlayersWithCoins[nameRef.current] = newPlayersWithCoins[nameRef.current] + 1;
      let message = {
        roomId: roomIdRef.current,
        type: "updated",
        totalCoins: newTotalCoins,
        playersWithTheirCards: newPlayersWithCards,
        playersWithCoins: newPlayersWithCoins,
      };
      sendMessage(message)
    }
    if (selectedOptionRef.current === "Take Two coins from bank") {
      newTotalCoins = newTotalCoins - 2;
      newPlayersWithCoins[nameRef.current] = newPlayersWithCoins[nameRef.current] + 2;
      let message = {
        roomId: roomIdRef.current,
        type: "updated",
        totalCoins: newTotalCoins,
        playersWithTheirCards: newPlayersWithCards,
        playersWithCoins: newPlayersWithCoins,
      };
      sendMessage(message)
    }
    if (selectedOptionRef.current === "Take Three coins from bank") {
      newTotalCoins = newTotalCoins - 3;
      newPlayersWithCoins[nameRef.current] = newPlayersWithCoins[nameRef.current] + 3;
      let message = {
        roomId: roomIdRef.current,
        type: "updated",
        totalCoins: newTotalCoins,
        playersWithTheirCards: newPlayersWithCards,
        playersWithCoins: newPlayersWithCoins,
      };
      sendMessage(message)
    }
    if (selectedOptionRef.current === "Steal 2 coins from other player") {
      newPlayersWithCoins[targetedMemberRef.current] =
        newPlayersWithCoins[targetedMemberRef.current] - 2;
      newPlayersWithCoins[nameRef.current] = newPlayersWithCoins[nameRef.current] + 2;
      let message = {
        roomId: roomIdRef.current,
        type: "updated",
        totalCoins: newTotalCoins,
        playersWithTheirCards: newPlayersWithCards,
        playersWithCoins: newPlayersWithCoins,
      };
      sendMessage(message)
    }
    if (selectedOptionRef.current === "Assassin a player with 3 coins") {
      let message2 = {
        roomId: roomIdRef.current,
        type: "assassin",
        to: targetedMemberRef.current,
        from : nameRef.current
      };
      sendMessage(message2)
    }
    if (selectedOptionRef.current === "Exchange your card with deck") {
      setRulesScreen(false)
      setShowAmbassadorScreen(true);
    }
    if (selectedOptionRef.current === "Coup a player with 14 coins") {
      newPlayersWithCoins[nameRef.current] = newPlayersWithCoins[nameRef.current] - 14;
      newTotalCoins = newTotalCoins + 14;
      let message1 = {
        roomId: roomIdRef.current,
        type: "updated",
        totalCoins: newTotalCoins,
        playersWithTheirCards: newPlayersWithCards,
        playersWithCoins: newPlayersWithCoins,
      };
      sendMessage(message1)

      let message2 = {
        roomId: roomIdRef.current,
        type: "coup with 14 coins",
        to: targetedMemberRef.current,
        from : nameRef.current
      };
      sendMessage(message2)
    }
    if (selectedOptionRef.current === "Coup a player with 7 coins") {
      let message2 = {
        roomId: roomIdRef.current,
        type: "coup with 7 coins",
        to: targetedMemberRef.current,
        from : nameRef.current
      };
      sendMessage(message2)
    }
    if ((selectedOptionRef.current !== "Exchange your card with deck" && selectedOptionRef.current !== "Coup a player with 7 coins" && selectedOptionRef.current !== "Take Two coins from bank") && (shouldReplaceCard === true)) {
      replaceWithNewCard();
    }
    if(selectedOptionRef.current === "Take One coin from bank" || selectedOptionRef.current === "Take Two coins from bank" || selectedOptionRef.current === "Take Three coins from bank" || selectedOptionRef.current === "Steal 2 coins from other player"){
      nextTurnFunction()
    }
  };

  const nextTurnFunction = () =>{
    let person;
    let playerIndex = playersInGameRef.current.indexOf(nameRef.current);
    if (
      playersInGameRef.current[playerIndex + 1] !== undefined &&
      playersInGameRef.current[playerIndex + 1] !== null
    ) {
      person = playersInGameRef.current[playerIndex + 1];
    } else {
      person = playersInGameRef.current[0];
    }
    let message = {
      roomId: roomIdRef.current,
      type: "turn",
      person: person,
    };
    sendMessage(message)
  }

  const checkForCounterActionYouDid = () => {
    let message = {
      roomId: roomIdRef.current,
      type: "block challenge response",
    };

    if (selectedOptionRef.current === "Take Two coins from bank") {
      if (playersWithTheirCardsRef.current[nameRef.current].includes("Duke")) {
        message["notifyMessage"] = `Challenge lost by ${turnRef.current}`;
        message["winner"] = nameRef.current;
        message["losser"] = turnRef.current;
      } else {
        message["notifyMessage"] = `Challenge won by ${turnRef.current}`;
        message["winner"] = turnRef.current;
        message["losser"] = nameRef.current;
      }
    }

    if (
      selectedOptionRef.current === "Coup a player with 7 coins" ||
      selectedOptionRef.current === "Assassin a player with 3 coins"
    ) {
      if (playersWithTheirCardsRef.current[nameRef.current].includes("Contessa")) {
        message["notifyMessage"] = `Challenge lost by ${turnRef.current}`;
        message["winner"] = nameRef.current;
        message["losser"] = turnRef.current;
      } else {
        message["notifyMessage"] = `Challenge won by ${turnRef.current}`;
        message["winner"] = turnRef.current;
        message["losser"] = nameRef.current;
      }
    }

    if (selectedOptionRef.current === "Steal 2 coins from other player") {
      if (
        playersWithTheirCardsRef.current[nameRef.current].includes("Captain") ||
        playersWithTheirCardsRef.current[nameRef.current].includes("Ambassador")
      ) {
        message["notifyMessage"] = `Challenge lost by ${turnRef.current}`;
        message["winner"] = nameRef.current;
        message["losser"] = turnRef.current;
      } else {
        message["notifyMessage"] = `Challenge won by ${turnRef.current}`;
        message["winner"] = turnRef.current;
        message["losser"] = nameRef.current;
      }
    }

    sendMessage(message)

    if (message.winner !== nameRef.current) {
      setWaitingToLoseCharacterViaChallenge(true)
      performLoseCardLogic();
    }
     else {
      let message = {
        roomId: roomIdRef.current,
        type: "you lost",
        from: nameRef.current,
        to: turnRef.current,
      };

      sendMessage(message)
    }
  };

  const onConfirmAmbassadorAction = async (playerCard, deckCard) => {
    setSelectedPlayerCard(null);
    setSelectedDeckCard(null);
    setSelectedPlayerCardIndex(null);
    setSelectedDeckCardIndex(null)
    setShowAmbassadorScreen(false);
    let newDeck = deckRef.current;
    let newPlayersWithCards = playersWithTheirCardsRef.current;
    let newPlayersWithCoins = playersWithCoinsRef.current

    if (playerCard !== null && deckCard !== null) {
      const index1 = newDeck.indexOf(deckCard);
      if (index1 !== -1) {
        newDeck.splice(index1, 1);
        newPlayersWithCards[nameRef.current].push(deckCard);
      }

      const index2 = newPlayersWithCards[nameRef.current].indexOf(playerCard);
      if (index2 !== -1) {
        newPlayersWithCards[nameRef.current].splice(index2, 1);
        newDeck.push(playerCard);
      }
    }

    let shuffledDeck = await shuffleDeck(newDeck);

    let message = {
      roomId: roomIdRef.current,
      type: "updated",
      deck: shuffledDeck,
      playersWithTheirCards: newPlayersWithCards,
      playersWithCoins: newPlayersWithCoins
    };

    sendMessage(message)
    nextTurnFunction()
  };

  const onAcceptBlock = () => {
    setShowBlockAcceptOrRejectBox(false);
    let message = {
      roomId: roomIdRef.current,
      type: "accept block",
      from: nameRef.current,
      notifyMessage: `${nameRef.current} accept the block of ${blockedByRef.current}`,
    };
    sendMessage(message)
  };

  const onChallengeBlock = () => {
    setShowBlockAcceptOrRejectBox(false);
    let message = {
      roomId: roomIdRef.current,
      type: "challenge block",
      from: nameRef.current,
      to: blockedByRef.current,
      notifyMessage: `${nameRef.current} challenged the block of ${blockedByRef.current}`,
    };
    sendMessage(message)
  };

  const [time, setTime] = useState(12);
  const [startTimer, setStartTimer] = useState(false);

  useEffect(() => {
  if (startTimer) { 
    const timer = setInterval(() => setTime((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }
  }, [startTimer]);

  return (
    <div>
      {!inRoom && (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900 p-4">
          <h1 className="text-4xl font-bold mb-6">ONLINE COUP</h1>

          <div className="w-full max-w-md bg-white p-6 shadow-md rounded-lg mt-6">
            <label className="block mb-2 font-semibold">YOUR NAME</label>
            <input
              type="text"
              className="w-full p-2 border rounded mb-4"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-row gap-4">
            <div className="w-1/2 max-w-md bg-white p-6 shadow-md rounded-lg mt-6">
              <h2 className="text-xl font-bold text-center mb-4">JOIN GAME</h2>
              <hr className="mb-4" />
              <label className="block mb-2 font-semibold">ROOM ID</label>
              <input
                type="text"
                className="w-full p-2 border rounded mb-4"
                value={roomId}
                onChange={(e) => {
                  setRoomId(e.target.value);
                  setGameStrength(2);
                }}
              />
              <button
                onClick={joinRoomServer}
                className="w-full p-2 bg-gray-400 text-white rounded cursor-pointer"
              >
                JOIN
              </button>
            </div>

            <div className="w-1/2 max-w-md bg-white p-6 shadow-md rounded-lg mt-6">
              <h2 className="text-xl font-bold text-center mb-4">
                CREATE GAME
              </h2>
              <hr className="mb-4" />
              <label className="block mb-2 font-semibold">
                # PLAYERS : {gameStrength}
              </label>
              <input
                type="range"
                min="2"
                max="6"
                className="w-full mb-4 cursor-grab"
                value={gameStrength}
                onChange={(e) => {
                  setGameStrength(e.target.value);
                  setRoomId("");
                }}
              />
              <button
                onClick={createRoomServer}
                className="w-full p-2 bg-gray-400 text-white rounded cursor-pointer"
              >
                CREATE
              </button>
            </div>
          </div>
        </div>
      )}
      {inRoom && (
        <div className="flex flex-row items-center justify-center min-h-screen bg-white text-gray-900">
          {(!inGame && !rulesScreen) && (
            <div
              className={`w-[85%] ${
                window.innerWidth >= 2560
                  ? "max-w-8xl"
                  : window.innerWidth >= 1440
                  ? "max-w-5xl"
                  : window.innerWidth >= 1280
                  ? "max-w-4xl"
                  : window.innerWidth >= 1024
                  ? "max-w-[630px]"
                  : ""
              } flex flex-col justify-center p-6 bg-gray-100 m-4`}
            >
              <p className="text-1xl font-bold text-center mb-2">
                Room ID: <span className="text-blue-500">{roomId}</span>
              </p>
              <hr className="mb-2" />
              <p className="text-lg font-semibold mb-2">
                Players ({members.length}/{gameStrength})
              </p>
              <ul className="space-y-2">
                {members.map((member, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center bg-gray-200 p-3 rounded-md"
                  >
                    <span>{member}</span>

                    <div className="flex flex-row gap-2">
                      {creator && member !== name && (
                        <button
                          className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition cursor-pointer"
                          onClick={() => kickPlayer(member)}
                        >
                          Kick
                        </button>
                      )}

                      {streams[member] && (
                        <div className="lg:hidden flex items-center justify-end">
                          {userSettings[member]?.isAudioOn ? (
                            <Mic
                              onClick={() =>
                                member === name && toggleAudio(member)
                              }
                              className={`text-green-500 w-5 h-5 ${
                                member !== name
                                  ? "opacity-50 cursor-not-allowed"
                                  : "cursor-pointer"
                              }`}
                            />
                          ) : (
                            <MicOff
                              onClick={() =>
                                member === name && toggleAudio(member)
                              }
                              className={`text-red-500 w-5 h-5 ${
                                member !== name
                                  ? "opacity-50 cursor-not-allowed"
                                  : "cursor-pointer"
                              }`}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-col gap-4">
                <button
                    onClick={()=>{setRulesScreen(true)}}
                    className="w-full p-2 bg-yellow-300 text-white font-semibold rounded-md hover:bg-yellow-300 transition cursor-pointer"
                  >
                    Rules
                </button>
                {creator && (
                  <button
                    disabled={members.length !== parseInt(gameStrength)}
                    onClick={startGame}
                    className={`w-full p-2 font-semibold rounded-md ${
                      members.length === parseInt(gameStrength)
                        ? "bg-green-500 text-white hover:bg-green-600 transition cursor-pointer"
                        : "bg-red-500 text-white cursor-not-allowed"
                    }`}
                  >
                    Start Game
                  </button>
                )}
                {creator ? (
                  <button
                    className="w-full p-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition cursor-pointer"
                    onClick={deleteRoom}
                  >
                    Delete Room
                  </button>
                ) : (
                  <button
                    className="w-full p-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 transition cursor-pointer"
                    onClick={leaveRoomServer}
                  >
                    Leave Room
                  </button>
                )}
              </div>
            </div>
          )}

          {(inGame && !rulesScreen) && (
            <div
              className={`relative w-[85%] ${
                window.innerWidth >= 2560
                  ? "max-w-8xl"
                  : window.innerWidth >= 1440
                  ? "max-w-5xl"
                  : window.innerWidth >= 1280
                  ? "max-w-4xl"
                  : window.innerWidth >= 1024
                  ? "max-w-[630px]"
                  : ""
              } flex flex-col justify-center items-center p-4`}
            >
              <div
                className={`flex ${
                  isMobile ? "flex-col" : "flex-row"
                } items-center w-full`}
              >
                <div className="flex flex-row gap-4 items-center w-full md:w-1/2 justify-center">
                  <div className="flex items-center justify-center text-white font-bold text-1xl flex-col">
                    <div className="w-[120px] h-[160px] rounded-lg shadow-lg border-2 border-gray-800 p-1 bg-amber-200">
                      <img
                        src={cardsDeck}
                        alt="Card Deck"
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                    <p className="font-bold text-black text-center mt-2">
                      {deck.length} Cards in Deck
                    </p>
                  </div>

                  <div className="flex items-center justify-center text-white font-bold text-1xl flex-col">
                    <div className="w-[160px] h-[160px] rounded-full shadow-lg border-2 border-gray-800 p-1 bg-amber-200">
                      <img
                        src={coins}
                        alt="Coins"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <p className="font-bold text-black text-center mt-2">
                      {totalCoins} Coins remaining
                    </p>
                  </div>
                </div>

                <div
                  className={`${
                    isMobile
                      ? "w-full border-t border-dashed"
                      : "h-full border-l border-dashed"
                  } border-gray-900 my-2`}
                ></div>

                <div className="flex flex-row mt-2 items-center w-full md:w-1/2 justify-center">
                  <div key={name} className="flex flex-col items-center">
                    <div className="flex gap-1">
                      {playersWithTheirCards[name]?.map((card, index) => (
                        <div
                          key={index}
                          className="w-[150px] h-[180px] rounded-lg shadow-lg border-2 border-gray-800 p-1 bg-amber-200"
                        >
                          <img
                            src={
                              card === "Duke"
                                ? Duke
                                : card === "Captain"
                                ? Captain
                                : card === "Assassin"
                                ? Assassin
                                : card === "Ambassador"
                                ? Ambassador
                                : card === "Contessa"
                                ? Contessa
                                : null
                            }
                            alt={card}
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="font-bold text-black text-center">
                      🪙 {playersWithCoins[name]} Coins
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full border-t border-dashed border-gray-900 my-2"></div>

              <div className="bg-amber-100 p-3 rounded-lg shadow-md w-[300px] border-2 border-gray-800">
                {members.map((player, index) => (
                  <div key={index} className="flex flex-row">
                    <span className="items-center font-bold text-black w-[100px]">
                      {player}
                    </span>

                    <span className="items-center font-semibold text-black w-[100px]">
                      🪙 {playersWithCoins[player] || 0}
                    </span>

                    <span className="items-center font-semibold text-black w-[100px]">
                      🎴 {playersWithTheirCards[player]?.length || 0}
                    </span>

                    <span className="lg:hidden w-[100px]">
                     {streams[player] && (
                        <div className="lg:hidden flex items-center justify-end">
                          {userSettings[player]?.isAudioOn ? (
                            <Mic
                              onClick={() =>
                                player === name && toggleAudio(player)
                              }
                              className={`text-green-500 w-5 h-5 ${
                                player !== name
                                  ? "opacity-50 cursor-not-allowed"
                                  : "cursor-pointer"
                              }`}
                            />
                          ) : (
                            <MicOff
                              onClick={() =>
                                player === name && toggleAudio(player)
                              }
                              className={`text-red-500 w-5 h-5 ${
                                player !== name
                                  ? "opacity-50 cursor-not-allowed"
                                  : "cursor-pointer"
                              }`}
                            />
                          )}
                          </div>
                        )}
                    </span>
                  </div>
                ))}
              </div>

              <div className="w-full border-t border-dashed border-gray-900 my-2"></div>

              <div className="flex flex-col gap-2">
               <div className="mt-2 flex flex-row gap-3">
                <button
                  className={`w-full p-2 text-white font-semibold rounded-md ${
                    (yourTurn && !showSelectLossCharacterBox && !showBlockAcceptOrRejectBox && !showAmbassadorScreen && !showPlayerSelection)
                      ? "bg-green-500 hover:bg-green-600 transition cursor-pointer "
                      : "bg-red-500 cursor-not-allowed"
                  }`}
                  onClick={() => (yourTurn && !showSelectLossCharacterBox && !showBlockAcceptOrRejectBox && !showAmbassadorScreen && !showPlayerSelection) && setShowOptions(true)}
                >
                  Actions
                </button>
                <button
                  className={`w-full p-2 text-white font-semibold rounded-md ${
                    (enableBlockButton && playersInGameRef.current.includes(nameRef.current))
                      ? "bg-green-500 hover:bg-green-600 transition cursor-pointer "
                      : "bg-red-500 cursor-not-allowed"
                  }`}
                  onClick={(enableBlockButton && playersInGameRef.current.includes(nameRef.current)) ? onClickBlock : null}
                >
                  Block
                </button>
                <button
                  className={`w-full p-2 text-white font-semibold rounded-md ${
                    (enableChallengeButton && playersInGameRef.current.includes(nameRef.current))
                      ? "bg-green-500 hover:bg-green-600 transition cursor-pointer "
                      : "bg-red-500 cursor-not-allowed"
                  }`}
                  onClick={(enableChallengeButton && playersInGameRef.current.includes(nameRef.current)) ? onClickChallenge : null}
                >
                  Challenge
                </button>
                <button
                 className={`w-full p-2 text-white font-semibold rounded-md ${
                  (!showOptions && !showPlayerSelection && !showSelectLossCharacterBox && !showAmbassadorScreen && !showBlockAcceptOrRejectBox)
                    ? "bg-green-500 hover:bg-green-600 transition cursor-pointer "
                    : "bg-red-500 cursor-not-allowed"
                }`}  
                  onClick={(!showOptions && !showPlayerSelection && !showSelectLossCharacterBox && !showAmbassadorScreen && !showBlockAcceptOrRejectBox) ? () => {setRulesScreen(true)} : null }
                >
                  Rules
                </button>
                </div>
                {startTimer && <div className="font-bold whitespace-nowrap items-center flex justify-center"> {`Time left - ${time} sec`}</div>}
              </div>
              {showOptions && (
                <div className={`absolute flex items-center justify-center ${!isMobile ? "top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2" : ""} `}>
                  <div className="bg-purple-200 p-4 rounded-lg shadow-lg w-auto relative flex flex-row gap-10">
                   <div>
                    <h2 className="text-lg font-semibold mb-3 flex justify-center">
                      Select an Action
                    </h2>
                    <ul className="text-black flex flex-col items-center">
                      {actionOptions.map((option) => (
                        <li
                          key={option}
                          className="px-2 py-2 cursor-pointer rounded-md"
                          onClick={() => {
                            handleOptionClick(option);
                            setSelectedOption(option);
                          }}
                        >
                          {option}
                        </li>
                      ))}
                    </ul>
                    </div>
                    <div>
                    <button
                      className="absolute top-4.5 right-5 text-black cursor-pointer"
                      onClick={() => setShowOptions(false)}
                    >
                      X
                    </button>
                    </div>
                  </div>
                </div>
              )}
              {showPlayerSelection && (
                <div className={`absolute flex items-center justify-center ${!isMobile ? "top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2" : ""} `}>
                  <div className="bg-purple-200 p-4 rounded-lg shadow-lg w-auto relative flex flex-row gap-10">
                    <div>
                    <h2 className="text-lg font-semibold mb-3 flex justify-center">
                      {`Choose a Player to ${
                        selectedOption === "Coup a player with 7 coins"
                          ? "Coup with 7 coins"
                          : selectedOption === "Coup a player with 14 coins"
                          ? "Coup with 14 coins"
                          : selectedOption === "Steal 2 coins from other player"
                          ? "Steal 2 coins"
                          : selectedOption === "Assassin a player with 3 coins"
                          ? "Assassin with 3 coins"
                          : ""
                      }`}
                    </h2>
                    <ul className="text-black flex flex-col items-center">
                      {(selectedOption === "Steal 2 coins from other player") ? 
                      Object.entries(playersWithCoinsRef.current)
                      .filter(([member, coins]) => member !== name && coins > 1) // Exclude current player & check coin count
                      .map(([member]) => (
                        <li
                          key={member}
                          className="px-2 py-2 cursor-pointer rounded-md"
                          onClick={() => confirmPlayerSelection(member)}
                        >
                          {member}
                        </li>
                      )) :
                      playersInGameRef.current
                        .filter((member) => member !== name) // Exclude current player
                        .map((member) => (
                          <li
                            key={member}
                            className="px-2 py-2 cursor-pointer rounded-md"
                            onClick={() => confirmPlayerSelection(member)}
                          >
                            {member}
                          </li>
                        ))}
                    </ul>
                    </div>
                    <div>
                    <button
                      className="absolute top-4.5 right-5 text-black cursor-pointer"
                      onClick={() => setShowPlayerSelection(false)}
                    >
                      X
                    </button>
                    </div>
                  </div>
                </div>
              )}
              {showSelectLossCharacterBox && (
                  <div className={`absolute flex items-center justify-center ${!isMobile ? "top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2" : ""} `}>
                  <div className="bg-purple-200 p-4 rounded-lg shadow-lg w-auto relative">
                    <h2 className="text-lg font-semibold mb-3 flex justify-center">
                      Select a Character to losser
                    </h2>
                    <ul className="text-black flex flex-col items-center">
                      {playersWithTheirCards[name].map((card) => (
                        <li
                          key={card}
                          className="px-2 py-2 cursor-pointer rounded-md"
                          onClick={() => confirmLossCardSelection(card)}
                        >
                          {card}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              {showAmbassadorScreen && (
                  <div className={`absolute flex items-center justify-center ${!isMobile ? "top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2" : ""} `}>
                    <div className="bg-purple-200 p-4 rounded-lg shadow-lg w-auto relative">
                      <div className="flex flex-row gap-4 items-center">
                        
                        {/* Player's Cards - Left Side */}
                        <div className="flex flex-col">
                          <h2 className="text-lg font-semibold mb-3 text-amber-500">Your Cards</h2>
                          <div className="flex flex-col gap-2 mt-2">
                            {playersWithTheirCards[name].map((card, index) => (
                              <p
                                className={`font-bold text-left cursor-pointer ${selectedPlayerCardIndex === index ? "text-green-400" : "text-black"}`}
                                key={index}
                                onClick={() => {setSelectedPlayerCard(card); setSelectedPlayerCardIndex(index)}}
                              >
                                {card}
                              </p>
                            ))}
                          </div>
                        </div>
                
                        {/* Deck's Top Two Cards - Right Side */}
                        <div className="flex flex-col">
                          <h2 className="text-lg font-semibold mb-3 text-amber-500">Deck Cards</h2>
                          <div className="flex flex-col gap-2 mt-2">
                            {deck.slice(0, 2).map((card, index) => (
                              <p
                                className={`font-bold text-left cursor-pointer ${(selectedDeckCardIndex === index) ? "text-green-400":"text-black"}`}
                                key={index}
                                onClick={() => {setSelectedDeckCard(card); setSelectedDeckCardIndex(index)}}
                              >
                                {card}
                              </p>
                            ))}
                          </div>
                        </div>
                
                        {/* Action Buttons */}
                        <div className="flex flex-col gap-4">
                          <button
                            className={`p-2 text-white font-semibold rounded-md ${
                              selectedDeckCard && selectedPlayerCard
                                ? "bg-blue-500 hover:bg-blue-600"
                                : "bg-gray-400 cursor-not-allowed"
                            }`}
                            disabled={!selectedDeckCard || !selectedPlayerCard}
                            onClick={() =>
                              onConfirmAmbassadorAction(selectedPlayerCard, selectedDeckCard)
                            }
                          >
                            Swap Cards
                          </button>
                
                          <button
                            className="p-2 text-white font-semibold rounded-md bg-red-500 hover:bg-red-600"
                            onClick={() => onConfirmAmbassadorAction(null, null)}
                          >
                            No Swap
                          </button>
                        </div>
                      </div>
                    </div>
                  </div> 
              )}
              {showBlockAcceptOrRejectBox && (
                <div className={`absolute flex items-center justify-center ${!isMobile ? "top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2" : ""} `}>
                  <div className="bg-purple-200 p-4 rounded-lg shadow-lg w-auto relative">
                  <h2 className="text-lg font-semibold mb-3 flex justify-center">
                    {`you have been blocked by ${blockedBy}`}
                  </h2>
                  <div className="flex gap-4 items-center justify-center">
                    <button
                      className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 cursor-pointer"
                      onClick={onAcceptBlock}
                    >
                      Accept
                    </button>
                    <button
                      className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 cursor-pointer"
                      onClick={onChallengeBlock}
                    >
                      Challenge
                    </button>
                  </div>
                </div>
                </div>
              )}
            </div>
          )}

          {rulesScreen && (
           <div
             className={`w-[85%] ${
               window.innerWidth >= 2560
                ? "max-w-8xl"
                : window.innerWidth >= 1440
                ? "max-w-5xl"
                : window.innerWidth >= 1280
                ? "max-w-4xl"
                : window.innerWidth >= 1024
                ? "max-w-[630px]"
                 : ""
                } flex flex-col justify-center items-center p-6 bg-gray-100 m-4 gap-10`}
            >
            <div className="overflow-x-auto">
             <table className="border border-gray-300 rounded-lg shadow-lg">
                <thead className="bg-gray-200">
                <tr>
                  <th className="py-2 px-2 border-b text-center">Name</th>
                  <th className="py-2 px-2 border-b text-center">Action</th>
                  <th className="py-2 px-2 border-b text-center">Counter Action</th>
                </tr>
                </thead>
              <tbody>
               {rules.map((rule, index) => (
                 <tr key={index} className="odd:bg-white even:bg-gray-100">
                 <td className="py-2 px-2 border-b text-center">{rule.name}</td>
                 <td className="py-2 px-2 border-b text-center">{rule.action}</td>
                 <td className="py-2 px-2 border-b text-center">{rule.counterAction}</td>
                 </tr>
                ))}
              </tbody>
             </table>
            </div> 
            <div>
              <ul className="text-black flex flex-col items-center mt-2">
                {gamerules.map((item) => (
                  <li
                    key={item}
                      className="px-2 py-2 cursor-pointer rounded-md"
                    >
                     {item}
                  </li>
                ))}
              </ul>
            </div> 
            <div>
            <button
              className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 cursor-pointer"
              onClick={()=>{setRulesScreen(false)}}
            >
              Close
            </button> 
            </div>
          </div>
          )}

          <div className="hidden lg:flex flex-[15%] flex-col items-center justify-center space-y-4 border-l-2 border-black h-screen">
            {members.map(
              (member, index) =>
                streams[member] && (
                  <div
                    key={index}
                    className={`relative max-w-xs ${
                      members.length <= 3
                        ? "h-40 w-full"
                        : members.length === 4
                        ? "h-35 w-full"
                        : members.length === 5
                        ? "h-27 w-5/8"
                        : "h-22 w-4/8"
                    } rounded-lg bg-black flex items-center justify-center shadow-lg`}
                  >
                    <video
                      ref={(el) => (videoRefs.current[member] = el)}
                      autoPlay
                      playsInline
                      className="w-full h-full rounded-lg"
                    />
                    <div className="absolute bottom-2 left-2 flex gap-2 bg-amber-200 bg-opacity-50 p-1 rounded-md">
                      {userSettings[member]?.isAudioOn ? (
                        <Mic
                          onClick={() => {
                            member === name ? toggleAudio(member) : null;
                          }}
                          className={`text-green-500 w-5 h-5  ${
                            member !== name
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer"
                          } `}
                        />
                      ) : (
                        <MicOff
                          onClick={() => {
                            member === name ? toggleAudio(member) : null;
                          }}
                          className={`text-red-500 w-5 h-5  ${
                            member !== name
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer"
                          } `}
                        />
                      )}

                      {userSettings[member]?.isVideoOn ? (
                        <Video
                          onClick={() => {
                            member === name ? toggleVideo(member) : null;
                          }}
                          className={`text-green-500 w-5 h-5  ${
                            member !== name
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer"
                          } `}
                        />
                      ) : (
                        <VideoOff
                          onClick={() => {
                            member === name ? toggleVideo(member) : null;
                          }}
                          className={`text-red-500 w-5 h-5  ${
                            member !== name
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer"
                          } `}
                        />
                      )}

                      <div className="bg-opacity-50 text-black text-sm px-2 rounded-md font-bold">
                        {member}
                      </div>
                    </div>
                  </div>
                )
            )}
          </div>
        </div>
      )}
      {notification.show && (
        <NotificationBar
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ ...notification, show: false })}
        />
      )}
      {loading && <LoadingScreen />}
    </div>
  );
}

export default App;
