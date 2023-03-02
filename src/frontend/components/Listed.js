import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Row, Col, Card } from "react-bootstrap";
import { render } from "@testing-library/react";

const renderSoldItems = (items) => (
  <>
    <h2>Sold</h2>
    <Row xs={1} md={2} lg={4} className="g-4 py-3">
      {items.map((item, idx) => (
        <Col key={idx} className="overflow-hidden">
          <Card>
            <Card.Img variant="top" src={item.image} />
            <Card.Footer>
              For {ethers.utils.formatEther(item.totalPrice)} ETH - Recieved{" "}
              {ethers.utils.formatEther(item.price)} ETH
            </Card.Footer>
          </Card>
        </Col>
      ))}
    </Row>
  </>
);

const Listed = ({ marketplace, nft, account }) => {
  const [loading, setLoading] = useState(true);
  const [listedItems, setListedItems] = useState([]);
  const [soldItems, setSoldItems] = useState([]);

  const loadListedItems = async () => {
    const itemCount = await marketplace.itemCount();
    const listedItems = [];
    const soldItems = [];

    for (let idx = 1; idx <= itemCount; idx++) {
      const i = await marketplace.items(idx);

      if (i.seller.toLowerCase() === account) {
        const uri = await nft.tokenURI(i.tokenId);
        const response = await fetch(uri);
        const metadata = await response.json();
        const totalPrice = await marketplace.getTotalPrice(i.itemId);

        const item = {
          totalPrice,
          price: i.price,
          itemId: i.itemId,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
        };

        if (i.sold) soldItems.push(item);
        else listedItems.push(item);
      }
    }

    setLoading(false);
    setListedItems(listedItems);
    setSoldItems(soldItems);
  };

  useEffect(() => {
    loadListedItems();
  }, []);

  return (
    <div className="flex justify-center">
      {listedItems.length > 0 || soldItems.length > 0 ? (
        <>
          {listedItems.length > 0 && (
            <div className="px-5 py-3 container">
              <h2>Listed</h2>
              <Row xs={1} md={2} lg={4} className="g-4 py-3">
                {listedItems.map((item, idx) => (
                  <Col key={idx} className="overflow-hidden">
                    <Card>
                      <Card.Img variant="top" src={item.image} />
                      <Card.Footer>
                        {ethers.utils.formatEther(item.totalPrice)} ETH
                      </Card.Footer>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {soldItems.length > 0 && (
            <div className="px-5 py-3 container">
              {renderSoldItems(soldItems)}
            </div>
          )}
        </>
      ) : (
        <main style={{ padding: "1rem 0 " }}>
          <h2>No listed assets</h2>
        </main>
      )}
    </div>
  );
};

export default Listed;
