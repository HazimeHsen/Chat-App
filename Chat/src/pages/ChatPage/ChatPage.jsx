import { AiOutlineSend } from "react-icons/ai";
import { GrAttachment } from "react-icons/gr";
import "./ChatPage.css";
import { useEffect, useRef, useState } from "react";
import { AiOutlineWechat } from "react-icons/ai";
import { uniqBy } from "lodash";
import axios from "axios";
import Cookies from "js-cookie";
import Contact from "../../components/Contact/Contact";
import { useNavigate } from "react-router-dom";
export default function ChatPage() {
  const [ws, setWs] = useState(null);
  const [online, setOnline] = useState({});
  const [offlinePeople, setOfflinePeople] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const username = userInfo ? userInfo.name : "";
  const userId = userInfo ? userInfo.userId : "";
  const divUnderMessages = useRef();
  const navigate = useNavigate();
  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
    }
  }, [navigate, userInfo]);
  useEffect(() => {
    connectTows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser]);
  const connectTows = () => {
    // Update the WebSocket URL to use a secure connection (wss://)
    const ws = new WebSocket(`wss://chat-me-ynmg.onrender.com/`);
    setWs(ws);
    ws.addEventListener("message", handelMessage);
    ws.addEventListener("close", () => {
      setTimeout(() => {
        connectTows();
      }, 1000);
    });
  };
  function handelMessage(e) {
    const messageData = JSON.parse(e.data);
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    } else if ("text" in messageData) {
      if (messageData.sender === selectedUser)
        setMessages((prev) => [...prev, { ...messageData }]);
    }
  }

  const showOnlinePeople = (online) => {
    const people = {};
    online.map(({ name, userId }) => (people[userId] = name));
    setOnline(people);
  };
  useEffect(() => {
    const getPeople = async () => {
      const { data } = await axios.get(
        `https://chat-me-ynmg.onrender.com/user/people`
      );
      const offline = data.filter((e) => !Object.keys(online).includes(e._id));
      const allOfflinePeople = {};
      offline.map((o) => (allOfflinePeople[o._id] = o));
      setOfflinePeople(allOfflinePeople);
    };
    getPeople();
  }, [offlinePeople, online]);

  const sendMessage = async (e, file = null) => {
    if (e) e.preventDefault();

    if (file) {
      const token = Cookies.get("token");

      const { data } = await axios.get(
        `https://chat-me-ynmg.onrender.com/message/${selectedUser}`,
        {
          headers: { authorization: `Bearer ${token}` },
        }
      );
      setMessages(data);
    } else {
      ws.send(
        JSON.stringify({
          recipient: selectedUser,
          text: newMessageText,
          file,
        })
      );
      setNewMessageText("");
      setMessages((prev) => [
        ...prev,
        {
          text: newMessageText,
          sender: userId,
          recipient: selectedUser,
          _id: Date.now(),
        },
      ]);
    }
  };

  const sendFile = (e) => {
    const reader = new FileReader(e.target.files[0]);
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = () => {
      sendMessage(null, {
        data: reader.result,
        name: e.target.files[0].name,
      });
    };
  };

  const logout = () => {
    setWs(null);
    localStorage.removeItem("userInfo");
    Cookies.remove("token");
    navigate("/login");
  };
  useEffect(() => {
    const div = divUnderMessages.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  useEffect(() => {
    const GetMessages = async () => {
      if (selectedUser) {
        const token = Cookies.get("token");
        try {
          const { data } = await axios.get(
            `https://chat-me-ynmg.onrender.com/message/${selectedUser}`,
            {
              headers: { authorization: `Bearer ${token}` },
            }
          );
          setMessages(data);
        } catch (error) {
          console.log(error);
        }
      }
    };
    GetMessages();
  }, [selectedUser]);

  const onlinePeopleExclOurUser = { ...online };
  delete onlinePeopleExclOurUser[userId];
  const messagesWithOutDupes = uniqBy(messages, "_id");

  return (
    <div className="flex h-screen">
      <div className="bg-white w-1/3 flex flex-col relative cont-contact">
        <div className="flex-grow scroll-contact overflow-y-scroll overflow-hidden ">
          <div className="direction">
            <div className="pt-2 pl-2 text-blue-600 font-bold flex gap-2 mb-4 items-center">
              <AiOutlineWechat className="chat-icon" />
              Live Chat
            </div>
            {Object.keys(onlinePeopleExclOurUser).map((userId) => (
              <Contact
                userId={userId}
                onClick={() => setSelectedUser(userId)}
                username={onlinePeopleExclOurUser[userId]}
                selected={userId === selectedUser}
                key={userId}
                online={true}
              />
            ))}
            {Object.keys(offlinePeople).map((userId) => (
              <Contact
                userId={userId}
                onClick={() => setSelectedUser(userId)}
                username={offlinePeople[userId].name}
                selected={userId === selectedUser}
                key={userId}
                online={false}
              />
            ))}
          </div>
        </div>
        <div className="w-full bg-white d-block p-2 absolute bottom-0 logout text-center">
          <span className="mr-2 text-gray-500">{username}</span>

          <button
            onClick={logout}
            className=" text-sm bg-blue-100 py-1 px-2 text-gray-500 rounded-sm border">
            <span>Logout</span>
          </button>
        </div>
      </div>
      <div className="chat-container flex flex-col bg-blue-50 w-2/3 p-2">
        <div className="flex-1">
          {!selectedUser && (
            <div className="flex flex-1 h-full items-center justify-center">
              {" "}
              <div className="text-gray-400">&larr; Select a person</div>
            </div>
          )}
          {!!selectedUser && (
            <div className="relative h-full">
              <div className="overflow-y-scroll message-scroll absolute inset-0">
                {messagesWithOutDupes.map((message) => (
                  <div
                    key={message._id}
                    className={`${
                      message.sender === userId ? "text-right" : "text-left"
                    }`}>
                    <div
                      className={`text-left inline-block p-2 my-1 rounded-md text-sm  ${
                        message.sender === userId
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-500"
                      }`}>
                      {message.text}
                      {message.file && (
                        <div>
                          <a
                            className="underline"
                            target="_blank"
                            href={
                              "https://chat-me-ynmg.onrender.com/" +
                              "/uploads/" +
                              message.file
                            }
                            rel="noreferrer">
                            {message.file}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={divUnderMessages}></div>
              </div>
            </div>
          )}
        </div>
        {!!selectedUser && (
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              type="text"
              placeholder="Type your message here"
              className="chat-input bg-white flex-grow border rounded-sm p-2"
            />
            <label className="attach cursor-pointer send-button bg-gray-200 p-2 flex items-center text-white rounded-sm overflow-hidden">
              <input type="file" className="hidden" onChange={sendFile} />
              <GrAttachment />
            </label>
            <button
              type="submit"
              className="send-button bg-blue-500 p-2 text-white rounded-sm">
              <AiOutlineSend />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
