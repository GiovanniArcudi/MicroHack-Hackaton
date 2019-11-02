from PIL import Image, ImageDraw, ImageFont, ImageTk
from Appliances import *
import copy


class Floor(object):
    """Floor class for the hackaton"""
    def __init__(self, imagePath: str):
        self._image = Image.open(imagePath, mode="r").convert('RGBA')
        self._image = self._image.resize((int(self._image.size[0]*(484/self._image.size[1])), 484))
        self.image = copy.deepcopy(self._image)
        self.appliances = {}

    def add(self, name: str, appliance: Appliance):
        """Add a new appliance to this floor"""
        self.appliances[name] = appliance

    def remove(self, name: str):
        """Remove an appliance from this floor"""
        del self.appliances[name]

    def getTkImage(self) -> ImageTk.PhotoImage:
        """Get tkInter ready image"""
        return ImageTk.PhotoImage(image=self.image)

    def move(self, name: str, x, y) -> ImageTk.PhotoImage:
        """Move an appliance and redraw image"""
        _x = self.appliances[name].coords[0] + x
        _y = self.appliances[name].coords[1] + y
        self.appliances[name].coords = (_x, _y)

        return self.draw()

    def switch(self, name: str):
        """Switch an appliance on and redraw"""
        self.appliances[name].switch()
        return self.draw()

    def draw(self) -> ImageTk.PhotoImage:
        """Draw the image with all appliances"""
        self.image = copy.deepcopy(self._image)
        for appliance in self.appliances:
            self.appliances[appliance].draw(self.image)

        return self.image

    def drawTkImage(self):
        self.draw()
        return self.getTkImage()
