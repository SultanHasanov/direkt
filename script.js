document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("fade-in");
    }
  });
}, observerOptions);

document.querySelectorAll("section").forEach((section) => {
  observer.observe(section);
});

window.addEventListener("scroll", () => {
  const header = document.querySelector("header");
  if (window.scrollY > 100) {
    header.style.background = "rgba(255, 255, 255, 0.98)";
  } else {
    header.style.background = "rgba(255, 255, 255, 0.95)";
  }
});

function toggleMobileMenu() {
  const navLinks = document.querySelector(".nav-links");
  navLinks.style.display = navLinks.style.display === "flex" ? "none" : "flex";
}

const scrollToTopBtn = document.getElementById("scrollToTop");

window.addEventListener("scroll", function () {
  if (window.pageYOffset > 300) {
    scrollToTopBtn.classList.add("visible");
  } else {
    scrollToTopBtn.classList.remove("visible");
  }
});

scrollToTopBtn.addEventListener("click", function () {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const editModal = document.getElementById("editModal");
  const modalClose = document.getElementById("modalClose");
  const cancelEdit = document.getElementById("cancelEdit");
  const editForm = document.getElementById("editForm");
  const memberNameInput = document.getElementById("memberName");
  const memberRoleInput = document.getElementById("memberRole");
  const memberIdInput = document.getElementById("memberId");
  const saveChangesBtn = document.getElementById("saveChanges");

  const API_URL = "https://fdfee0f9ac8cfbb9.mokky.dev/items";
  let teamMembers = [];

  // Load initial data
  async function loadInitialData() {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          teamMembers = data;
          teamMembers.forEach((member) => {
            const editButton = document.querySelector(
              `.edit-btn[data-id="${member.id}"]`
            );
            if (editButton) {
              const cardParent = editButton.closest(".team-member");
              cardParent.querySelector(".member-name").textContent =
                member.name;
              cardParent.querySelector(".member-role").textContent =
                member.role;
            }
          });
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }

  loadInitialData();

  const editButtons = document.querySelectorAll(".edit-btn");

  editButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const memberId = parseInt(this.getAttribute("data-id"));
      const member = teamMembers.find((m) => m.id === memberId);

      if (member) {
        memberIdInput.value = member.id;
        memberNameInput.value = member.name;
        memberRoleInput.value = member.role;

        editModal.classList.add("active");
      }
    });
  });

  function closeModal() {
    editModal.classList.remove("active");
  }

  modalClose.addEventListener("click", closeModal);
  cancelEdit.addEventListener("click", closeModal);

  editForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const memberId = parseInt(memberIdInput.value);
    const newName = memberNameInput.value.trim();
    const newRole = memberRoleInput.value.trim();

    if (!newName || !newRole) return;

    try {
      saveChangesBtn.disabled = true;
      saveChangesBtn.classList.add("loading");

      const response = await fetch(`${API_URL}/${memberId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newName,
          role: newRole,
        }),
      });

      if (!response.ok) throw new Error("Failed to update");

      const memberIndex = teamMembers.findIndex((m) => m.id === memberId);
      if (memberIndex !== -1) {
        teamMembers[memberIndex].name = newName;
        teamMembers[memberIndex].role = newRole;

        const memberCard = document
          .querySelector(`.edit-btn[data-id="${memberId}"]`)
          .closest(".team-member");
        memberCard.querySelector(".member-name").textContent = newName;
        memberCard.querySelector(".member-role").textContent = newRole;
      }

      closeModal();
    } catch (error) {
      console.error("Error updating member:", error);
      alert("Failed to update team member. Please try again.");
    } finally {
      saveChangesBtn.disabled = false;
      saveChangesBtn.classList.remove("loading");
    }
  });

  editModal.addEventListener("click", function (e) {
    if (e.target === this) {
      closeModal();
    }
  });
});
