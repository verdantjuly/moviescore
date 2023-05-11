const nickname = document.getElementById("nickname");
const password = document.getElementById("password");
const Authpassword = document.getElementById("Authpassword");
const url = document.getElementById("url");
const $starPoint = document.querySelector("#starPoint");
const comment = document.getElementById("comment");
const createBtn = document.getElementById("createBtn");
const editbtn = document.getElementById("editBtn");
const createEventbtn = document.getElementById("createEventbtn");
const editEventbtn = document.getElementById("editEventBtn");
const delEventbtn = document.getElementById("delEventBtn");
const listbox = document.getElementById("cards-box");
const regExp =
  /^(?=.*[a-zA-z])(?=.*[0-9])(?=.*[$`~!@$!%*#^?&\\(\\)\-_=+]).{8,16}$/;
let selectedId;

window.addEventListener("load", async () => {
  const api = await fetch("/get-list");
  const result = await api.json();

  for (info of result) {
    const star = '<i class="fa-solid fa-star"></i>'.repeat(info.starpoint);
    listbox.innerHTML += `<div class="col">
        <div class="card h-100 ">
          <img src="${info.imageurl}"
            class="card-img-top">
          <div class="card-body">
            <h5 class="card-title">${info.title}</h5>
            <p class="card-text">${info.desc}</p>
            <div>
                        <p>${star}</p>
            <p><b>${info.nickname}님의 영화 후기</b><div style="height:50px; overflow: hidden;"><span class="mycomment">${info.comment}</span></div></p>
              <span class="editbox" onclick="editEvents('${info.id}')" data-bs-toggle="modal"
                  data-bs-target="#passwordmodal"><i class="fa-solid fa-pen-to-square"></i> 수정</span>&nbsp;
                <span class="delbox" onclick="delEvents('${info.id}')" data-bs-toggle="modal"
                  data-bs-target="#passwordmodal"><i idata-bs-toggle="modal" data-bs-target="#interfacemodal"
                    class="fa-solid fa-trash"></i> 삭제</span>&nbsp;
                    <span style="font-size:14px; cursor: pointer;" onclick="window.open('${info.url}','_blank')"><i class="fa-solid fa-link"></i> 자세히 보기</span>
            </div>
          </div>
        </div>
      </div>`;
  }
});

createBtn.addEventListener("click", async () => {
  const starPointIdx = starPoint.selectedIndex;
  const starPointvalue = starPoint.options[starPointIdx].value;

  if (!nickname.value) return alert("닉네임을 입력해 주세요.");
  if (!password.value) return alert("암호를 입력해 주세요.");
  if (!regExp.test(password.value))
    return alert(
      "암호는 최소 8자 이상 16자 이하로 영문, 숫자, 특수문자를 최소 한 가지씩 조합하여 입력해 주세요."
    );
  if (!url.value) return alert("다음 영화URL을 입력해 주세요.");
  if (!starPointIdx) return alert("별점을 선택해 주세요.");
  if (!comment.value) return alert("코멘트를 입력해 주세요.");

  let Decision = confirm("등록하시겠습니까?");

  if (Decision) {
    const api = await fetch("/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        new sendDocument(
          nickname.value,
          password.value,
          url.value,
          starPointvalue,
          comment.value
        )
      ),
    });

    const result = await api.json();

    if (result == 1) {
      alert("정상 등록되었습니다.");
      window.location.reload();
    } else {
      alert("등록에 실패하였습니다.\n관리자에게 문의해 주세요.");
    }
  }
});

editEventBtn.addEventListener("click", async () => {
  if (!regExp.test(Authpassword.value))
    return alert(
      "암호는 최소 8자 이상 16자 이하로 영문, 숫자, 특수문자를 최소 한 가지씩 조합하여 입력해 주세요."
    );

  const api = await fetch("/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(new auth(selectedId, Authpassword.value)),
  });

  const result = await api.json();

  if (result == null) {
    alert("패스워드가 일치하지 않습니다.");
  } else {
    editbtn.style.display = "block";
    createBtn.style.display = "none";

    nickname.value = result.nickname;
    password.value = result.password;
    url.value = result.url;
    $starPoint.value = result.starpoint;
    comment.value = result.comment;

    $("#passwordmodal").modal("hide");
    $("#interfacemodal").modal("show");
    editbtn.setAttribute(
      "onclick",
      `edit('${selectedId}, ${Authpassword.value}')`
    );
  }
});

async function edit(id, pw) {
  const starPointIdx = starPoint.selectedIndex;
  const starPointvalue = starPoint.options[starPointIdx].value;

  if (!nickname.value) return alert("닉네임을 입력해 주세요.");
  if (!password.value) return alert("암호를 입력해 주세요.");
  if (!regExp.test(password.value))
    return alert(
      "암호는 최소 8자 이상 16자 이하로 영문, 숫자, 특수문자를 최소 한 가지씩 조합하여 입력해 주세요."
    );
  if (!url.value) return alert("다음 영화URL을 입력해 주세요.");
  if (!starPointIdx) return alert("별점을 선택해 주세요.");
  if (!comment.value) return alert("코멘트를 입력해 주세요.");

  let Decision = confirm("수정하시겠습니까?");

  if (Decision) {
    const api = await fetch("/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth: { id: id, pw: pw },
        doc: {
          nickname: nickname.value,
          password: password.value,
          url: url.value,
          starPoint: starPoint.value,
          comment: comment.value,
        },
      }),
    });

    const result = await api.json();

    if (result == 1) {
      alert("수정이 완료되었습니다.");
      window.location.reload();
    } else {
      alert("수정을 실패하였습니다.\n관리자에게 문의해 주세요.");
    }
  }
}

delEventBtn.addEventListener("click", async () => {
  if (!regExp.test(Authpassword.value))
    return alert(
      "암호는 최소 8자 이상 16자 이하로 영문, 숫자, 특수문자를 최소 한 가지씩 조합하여 입력해 주세요."
    );

  const api = await fetch("/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(new auth(selectedId, Authpassword.value)),
  });

  const result = await api.json();
  console.log(result);
  if (result == null) {
    alert("패스워드가 일치하지 않습니다.");
  } else {
    let Decision = confirm("정말 삭제하시겠습니까?");

    if (Decision) {
      const api = await fetch("/del", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(new auth(selectedId, Authpassword.value)),
      });

      const result = await api.json();

      if (result == 1) {
        alert("삭제가 완료되었습니다.");
        window.location.reload();
      } else {
        alert("삭제를 실패하였습니다.\n관리자에게 문의해 주세요.");
      }
    }
  }
});

function editEvents(id) {
  editEventbtn.style.display = "block";
  delEventbtn.style.display = "none";
  selectedId = id;
}

function delEvents(id) {
  editEventbtn.style.display = "none";
  delEventbtn.style.display = "block";
  selectedId = id;
}

function createEvents() {
  if (editbtn.style.display == "block") {
    nickname.value = "";
    password.value = "";
    url.value = "";
    $starPoint.options[0].selected = true;
    comment.value = "";
  }

  editbtn.style.display = "none";
  createBtn.style.display = "block";
}

class sendDocument {
  constructor(nickname, password, url, starPoint, comment) {
    this.nickname = nickname;
    this.password = password;
    this.url = url;
    this.starPoint = starPoint;
    this.comment = comment;
  }
}

class auth {
  constructor(id, password) {
    this.id = id;
    this.password = password;
  }
}
