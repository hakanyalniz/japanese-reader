import SidePanel from "../../components/SidePanel/SidePanel";
import "./Home.css";

function Home() {
  return (
    <div className="home-flex">
      <div className="container">
        <h1>Vite + React</h1>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum
          ullamcorper nunc eget arcu accumsan, pretium condimentum nulla
          dignissim. Maecenas vel leo non augue condimentum venenatis ut nec
          erat. Sed in eros porttitor erat ultricies hendrerit id eu est.
          Integer blandit est ut arcu tempus ultricies. Fusce quis semper enim,
          at egestas mi. Mauris porta ipsum quis augue gravida, a ultricies
          tellus porttitor. Aenean euismod at ipsum id hendrerit. Phasellus at
          eros quis mauris hendrerit tempor ac eu eros. Vestibulum feugiat justo
          et augue elementum egestas. Donec lorem nunc, porttitor a aliquam
          eget, rutrum nec risus. Nullam feugiat massa ac ipsum facilisis, ac
          finibus mauris egestas. Suspendisse laoreet eget ex a fringilla. Sed
          non fermentum purus, aliquet porttitor dui. Proin consequat iaculis
          orci a venenatis. Mauris venenatis enim quis iaculis feugiat. Nunc
          quis dui mauris. Vestibulum eu aliquam augue. Sed eleifend felis nec
          est commodo finibus. Curabitur cursus gravida egestas. Suspendisse
          potenti. Morbi ac semper leo. Praesent at felis tellus. Mauris finibus
          eros at leo ornare pretium. Phasellus viverra posuere neque cursus
          dictum. Class aptent taciti sociosqu ad litora torquent per conubia
          nostra, per inceptos himenaeos. Nunc ante massa, venenatis ut faucibus
          non, pretium sit amet sem. Integer pretium venenatis felis eu
          suscipit. Aenean ac dui eu augue ultricies pretium quis eget ipsum.
        </p>
      </div>

      <SidePanel />
    </div>
  );
}

export default Home;
