console.log("Products frontend javascript file");
$(function () {
  $("#process-btn").on("click", () => {
    $(".dish-container").slideToggle(500);
    $("#process-btn").css("display", "none");
  });

  $("#cancel-btn").on("click", () => {
    $(".dish-container").slideToggle(100);
    $("#process-btn").css("display", "flex");
  });

  $(".new-product-status").on("change", async function (e) {
    const id = e.target.id;
    const courseStatus = $(`#${id}.new-product-status`).val();
    const courseSaledPrice = $(`#${id}.saled-price`).val();
    console.log("id:", id);
    console.log("productStatus:", courseStatus);

    try {
      const response = await axios.post(`/admin/course/${id}`, {
        courseStatus: courseStatus,
        courseSaledPrice: courseSaledPrice,
      });
      console.log("res:", response);
      const result = response.data;
      if (result.data) {
        console.log("Product updated!");
        $(".new-product-status").blur();
      } else {
        alert("Product update failed!");
      }
    } catch (err) {
      console.log(err);
      alert("Product update failed!");
    }
  });
});

function validateForm() {
  const courseName = $(".product-name").val();
  const coursePrice = $(".product-price").val();
  const courseDuration = $(".course-duration").val();
  const courseCategory = $(".course-category").val();
  const courseMentor = $(".course-mentor").val();
  const courseDesc = $(".course-desc").val();
  const courseStatus = $(".product-status").val();

  if (
    courseName === "" ||
    coursePrice === "" ||
    courseDuration === "" ||
    courseCategory === "" ||
    courseMentor === "" ||
    courseDesc === "" ||
    courseStatus === ""
  ) {
    alert("Please insert all details!");
    return false;
  } else {
    return true;
  }
}

function previewFileHandler(input, order) {
  const imgClassName = input.className;
  console.log("input:", input);

  const file = $(`.${imgClassName}`).get(0).files[0];
  const fileType = file["type"];
  const validImageType = ["image/jpg", "image/jpeg", "image/png"];
  if (!validImageType.includes(fileType)) {
    alert("Please insert only jpg, jpeg, and png!");
  } else {
    if (file) {
      const reader = new FileReader();
      reader.onload = function () {
        $(`#image-section-${order}`).attr("src", reader.result);
      };
      reader.readAsDataURL(file);
    }
  }
}
