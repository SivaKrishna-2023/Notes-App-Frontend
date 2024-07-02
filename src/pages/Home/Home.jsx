import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../../components/Navbar/Navbar";
import NoteCard from "../../components/Cards/NoteCard";
import { MdAdd } from "react-icons/md";
import AddEditNotes from "./AddEditNotes";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import Toast from "../../components/ToastMessage/Toast";
import EmptyCard from "../../components/EmptyCard/EmptyCard";
import image1 from "./image1.jpg";
import image2 from "./image2.jpg";

Modal.setAppElement("#root");

const Home = () => {
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [showToastMsg, setShowToastMsg] = useState({
    isShown: false,
    message: "",
    type: "add",
  });

  const [allNotes, setAllNotes] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [isSearch, setIsSearch] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const showToastMessage = (message, type) => {
    setShowToastMsg({
      isShown: true,
      message,
      type,
    });
  };

  const handleCloseToast = () => {
    setShowToastMsg({
      isShown: false,
      message: "",
    });
  };

  const handleEdit = (noteDetails) => {
    setOpenAddEditModal({ isShown: true, data: noteDetails, type: "edit" });
  };

  const getUserInfo = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/get-user");
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
        setError(null); // Clear the error state if the request is successful
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.clear();
        navigate("/login");
      } else {
        console.error("An unexpected error occurred:", error);
        setError("An unexpected error occurred while fetching user info. Please try again.");
      }
    }
  }, [navigate]);

  const getAllNotes = async () => {
    try {
      const response = await axiosInstance.get("/get-all-notes");
      if (response.data && response.data.notes) {
        setAllNotes(response.data.notes);
        setError(null); // Clear the error state if the request is successful
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      setError("An unexpected error occurred while fetching notes. Please try again.");
    }
  };

  const deleteNote = async (data) => {
    const noteId = data._id;
    try {
      const response = await axiosInstance.delete("/delete-note/" + noteId);
      if (response.data && !response.data.error) {
        showToastMessage("Note Deleted Successfully", "delete");
        getAllNotes();
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      setError("An unexpected error occurred while deleting the note. Please try again.");
    }
  };

  const onSearchNote = async (query) => {
    try {
      setIsSearch(true);
      const response = await axiosInstance.get("/search-notes/", {
        params: { query },
      });
      if (response.data && response.data.notes) {
        setAllNotes(response.data.notes);
        setError(null); // Clear the error state if the request is successful
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      setError("An unexpected error occurred while searching notes. Please try again.");
    }
  };

  const updateIsPinned = async (noteData) => {
    const noteId = noteData._id;
    try {
      const response = await axiosInstance.put("/update-note-pinned/" + noteId, {
        isPinned: !noteData.isPinned,
      });
      if (response.data && response.data.note) {
        showToastMessage("Note Updated Successfully");
        getAllNotes();
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      setError("An unexpected error occurred while updating the note. Please try again.");
    }
  };

  const handleClearSearch = () => {
    setIsSearch(false);
    getAllNotes();
  };

  useEffect(() => {
    getAllNotes();
    getUserInfo();
  }, [getUserInfo]);

  return (
    <>
      <Navbar
        userInfo={userInfo}
        onSearchNote={onSearchNote}
        handleClearSearch={handleClearSearch}
      />
      <div className="container mx-auto">
        {error && <div className="text-red-500">{error}</div>}
        {allNotes.length > 0 ? (
          <div className="grid grid-cols-3 gap-4 mt-8">
            {allNotes.map((item) => (
              <NoteCard
                key={item._id}
                title={item.title}
                date={item.createdOn}
                content={item.content}
                tags={item.tags}
                isPinned={item.isPinned}
                onEdit={() => handleEdit(item)}
                onDelete={() => deleteNote(item)}
                onPinNote={() => updateIsPinned(item)}
              />
            ))}
          </div>
        ) : (
          <EmptyCard
            imgSrc={isSearch ? image2 : image1}
            message={
              isSearch
                ? "Oops, no notes found matching your search."
                : "Start creating your first note! Click the 'Add' button to jot down your thoughts, ideas, and reminders. Let's get started!"
            }
          />
        )}
      </div>

      <button
        className="w-16 h-16 flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10"
        onClick={() => {
          setOpenAddEditModal({ isShown: true, type: "add", data: null });
        }}
      >
        <MdAdd className="text-[32px] text-white" />
      </button>

      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => {
          setOpenAddEditModal({ isShown: false, type: "add", data: null });
        }}
        style={{
          overlay: {
            backgroundColor: "",
          },
        }}
        contentLabel=""
        className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll"
      >
        <AddEditNotes
          type={openAddEditModal.type}
          noteData={openAddEditModal.data}
          onClose={() => {
            setOpenAddEditModal({ isShown: false, type: "add", data: null });
          }}
          getAllNotes={getAllNotes}
          showToastMessage={showToastMessage}
        />
      </Modal>

      <Toast
        isShown={showToastMsg.isShown}
        message={showToastMsg.message}
        type={showToastMsg.type}
        onClose={handleCloseToast}
      />
    </>
  );
};

export default Home;
