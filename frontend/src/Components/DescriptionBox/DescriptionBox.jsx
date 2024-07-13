import React from 'react'
import './DescriptionBox.css'

const DescriptionBox = () => {
  return (
    <div className='descriptionbox'>
        <div className="descriptionbox-navigator">
          <div className="descriptionbox-nav-box">Description</div>
          <div className="descriptionbox-nav-box fade">Reviews (124)</div>
        </div>
        <div className="descritionbox-description">
            <p>An e-commerce website is an online platfrom that facilities
                buying and selling of product or services over the internal 
                serves as a virtual markertpalce where businesses and indiviusal
                showcase their products, interact with customers, and conduction 
                transcations without the need for a physcial presence. E-commerce
                website have gained immense popularity due to their converecne accesibility,
                and the global reach they offer.
            </p>
            <p>E-commerce website typically display product or services along with detailed 
                description,images,prices,and any available variables(eg.sizes,colors).
                Each product usually has its own dedicated page with relevant,information.
            </p>
        </div>
    </div>
  )
}

export default DescriptionBox