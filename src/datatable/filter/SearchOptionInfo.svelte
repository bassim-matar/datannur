<script lang="ts"></script>

<h2 class="popup-title">options de recherche</h2>
<table>
  <tbody>
    <tr>
      <td>...</td>
      <td>contient ...</td>
    </tr>
    <tr>
      <td>&gt; ...</td>
      <td>Plus grand que ...</td>
    </tr>
    <tr>
      <td>&lt; ...</td>
      <td>Plus petit que ...</td>
    </tr>
    <tr>
      <td>= ...</td>
      <td>contient exactement ...</td>
    </tr>
    <tr>
      <td>! ...</td>
      <td>ne contient pas ...</td>
    </tr>
    <tr>
      <td>=""</td>
      <td>ne contient rien</td>
    </tr>
    <tr>
      <td>!""</td>
      <td>ne contient pas rien</td>
    </tr>
  </tbody>
</table>

<style lang="scss">
  @use 'main.scss' as *;

  table {
    width: 100%;
    border-collapse: collapse;
    & td {
      padding: 5px 10px;
      text-align: left;
    }
  }

  .popup-title {
    font-weight: bold;
    font-size: 18px;
  }
</style>
