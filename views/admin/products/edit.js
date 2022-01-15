const { getError } = require('../../helpers'); 
const layout = require('../layout');

module.exports = ({ product, errors }) => {
  return layout({
    content: `
      <div class="columns is-centered">
        <div class="column is-half">
          <h1 class="subtitle">Edit a Product</h1>

          <form method="POST" enctype="multipart/form-data">
            <div class="field">
              <label class="label">Title</label>
              <input value="${
                product.title
              }" class="input" placeholder="Title" name="title">
              <p class="help is-danger">${getError(errors, 'title')}</p>
            </div>
            
            <div class="field">
              <label class="label">Price</label>
              <input value="${
                product.price
              }" class="input" placeholder="Price" name="price">
              <p class="help is-danger">${getError(errors, 'price')}</p>
            </div>
            
            <div class="field">
              <label class="label">Image</label>            
              <input type="file" name="image" />
            </div>
            <br />
            <button class="button is-primary">Edit</button>
          </form>
        </div>
      </div>
    `
  });
};


// module.exports = ({ product, errors }) => {
//   return layout({ 
//     content: `
//       <form method="POST">
//         <input name="title" value="${product.title}" />
//         ${getError(errors, 'title')}
//         <input name="price" value="${product.price}" />
//         ${getError(errors, 'price')}
//         <input name="image" type="file" />
//         <button>Submit</button>
//       </form>
//     `
//   });
// };
